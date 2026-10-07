import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import { assertSafeImageKitPath } from '@/lib/imagekit/assertSafeImageKitPath';
import { getImageKit } from '@/lib/imagekit/client';
import { getImageUrl } from '@/lib/imagekit/get-image-url';
import { getImageKitFolder } from '@/lib/imagekit/getImageKitFolder';
import { prisma } from '@/lib/prisma';
import { getImageValidationError } from '@/lib/media/image-policy';
import type { PhotoRow } from '@/app/(admin)/admin/(protected)/projects/[id]/photo-manager/types';

type Params = {
  params: Promise<{ id: string }>;
};

/**
 * POST /api/admin/projects/[id]/photos/upload
 *
 * Finalizes a photo that has already been uploaded directly
 * from the browser to ImageKit.
 *
 * Accepts JSON: { fileId }.
 *
 * The server:
 * - verifies the project exists;
 * - fetches authoritative file data from ImageKit;
 * - verifies that the asset belongs to the expected project folder;
 * - validates the image type and size;
 * - creates MediaAsset + Photo in Postgres.
 *
 * If the DB write fails and the asset is not already referenced in DB,
 * the route attempts a compensating ImageKit delete.
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ message: 'Немає доступу' }, { status: 401 });
  }

  const { id } = await params;

  // ── 1. Verify project exists ──────────────────────────────────────────────
  const project = await prisma.project.findUnique({
    where: { id },
    select: { slug: true },
  });

  if (!project) {
    return NextResponse.json({ message: 'Проєкт не знайдено' }, { status: 404 });
  }

  // ── 2. Parse fileId ───────────────────────────────────────────────────────
  let body: { fileId?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Неправильний формат запиту' }, { status: 400 });
  }

  const fileId = body.fileId?.trim();

  if (!fileId) {
    return NextResponse.json({ message: 'ImageKit fileId не передано' }, { status: 400 });
  }

  // ── 3. Fetch and validate ImageKit asset ──────────────────────────────────
  const imageKit = getImageKit();

  let imageKitFile: Awaited<ReturnType<typeof imageKit.files.get>>;

  try {
    imageKitFile = await imageKit.files.get(fileId);
  } catch (error) {
    console.error('Failed to get ImageKit file:', error);

    return NextResponse.json({ message: 'Не вдалося знайти файл в ImageKit' }, { status: 400 });
  }

  const { filePath, width, height, mime, size, fileType } = imageKitFile;

  if (!filePath || width == null || height == null || !mime || size == null || !fileType) {
    return NextResponse.json(
      { message: 'ImageKit повернув неповні дані про файл' },
      { status: 502 }
    );
  }

  const expectedFolder = getImageKitFolder('projects', project.slug, 'photos').replace(/\/+$/, '');

  const expectedPrefix = `${expectedFolder}/`;

  if (!filePath.startsWith(expectedPrefix)) {
    return NextResponse.json(
      { message: 'Файл знаходиться поза папкою цього проєкту' },
      { status: 400 }
    );
  }

  try {
    assertSafeImageKitPath(filePath);
  } catch {
    return NextResponse.json({ message: 'Небезпечний ImageKit path' }, { status: 400 });
  }

  const imageError =
    fileType !== 'image' ? 'Непідтримуваний тип зображення' : getImageValidationError(mime, size);
  if (imageError) {
    return NextResponse.json({ message: imageError }, { status: 400 });
  }

  // ── 4. Determine next order ───────────────────────────────────────────────
  const aggregate = await prisma.photo.aggregate({
    where: { projectId: id },
    _max: { orderInProject: true },
  });

  const nextOrder = (aggregate._max.orderInProject ?? -1) + 1;

  // ── 5. Create MediaAsset + Photo ──────────────────────────────────────────
  try {
    const photo = await prisma.$transaction(async (tx) => {
      const asset = await tx.mediaAsset.create({
        data: {
          imageKitFileId: fileId,
          src: filePath,
          width,
          height,
        },
      });

      return tx.photo.create({
        data: {
          assetId: asset.id,
          projectId: id,
          orderInProject: nextOrder,
          isProjectCover: false,
        },
        include: {
          asset: true,
        },
      });
    });

    revalidateTag('projects', 'max');
    revalidateTag(`project-${project.slug}`, 'max');

    return NextResponse.json(
      {
        photo: {
          id: photo.id,
          imageUrl: getImageUrl(photo.asset.src),
          width: photo.asset.width,
          height: photo.asset.height,
          orderInProject: photo.orderInProject,
          isProjectCover: photo.isProjectCover,
          captionUk: photo.captionUk,
          captionEn: photo.captionEn,
          linkUrl: photo.linkUrl,
          descriptionUk: photo.descriptionUk,
          descriptionEn: photo.descriptionEn,
        } satisfies PhotoRow,
      },
      { status: 201 }
    );
  } catch (dbError) {
    console.error('MediaAsset/Photo create failed after ImageKit upload:', dbError);

    // ── 6. Compensating cleanup ─────────────────────────────────────────────
    //
    // Never delete an ImageKit asset that is already represented in DB.
    // This protects against duplicate finalize requests and race conditions.
    const existingAsset = await prisma.mediaAsset.findUnique({
      where: { imageKitFileId: fileId },
      select: { id: true },
    });

    if (existingAsset) {
      console.warn('Skipping compensating delete because MediaAsset already exists:', fileId);

      return NextResponse.json(
        {
          message: 'Цей файл уже зареєстрований у базі даних.',
        },
        { status: 409 }
      );
    }

    try {
      assertSafeImageKitPath(filePath);
      await imageKit.files.delete(fileId);

      console.info('Compensating delete succeeded for ImageKit fileId:', fileId);
    } catch (cleanupError) {
      console.error('Compensating delete failed. Orphaned ImageKit fileId:', fileId, cleanupError);

      return NextResponse.json(
        {
          message:
            'Не вдалося зберегти фото до бази даних. Не вдалося автоматично видалити файл з ImageKit.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Не вдалося зберегти фото до бази даних. Файл ImageKit видалено.',
      },
      { status: 500 }
    );
  }
}
