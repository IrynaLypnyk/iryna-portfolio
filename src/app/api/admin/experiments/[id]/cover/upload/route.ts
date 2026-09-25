import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import { assertSafeImageKitPath } from '@/lib/imagekit/assertSafeImageKitPath';
import { getImageKit } from '@/lib/imagekit/client';
import { getImageUrl } from '@/lib/imagekit/get-image-url';
import { getImageKitFolder } from '@/lib/imagekit/getImageKitFolder';
import { prisma } from '@/lib/prisma';
import { getImageValidationError } from '@/lib/media/image-policy';
import { deleteMediaAssetIfUnused } from '@/lib/media/delete-media-asset';

type Params = {
  params: Promise<{ id: string }>;
};

/**
 * POST /api/admin/experiments/[id]/cover/upload
 *
 * Finalizes a cover image already uploaded from the browser to ImageKit.
 * Unlike project photos, an experiment has exactly one cover: this replaces
 * whatever asset was previously set, orphan-cleaning it afterwards.
 */
export async function POST(request: NextRequest, { params }: Params) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ message: 'Немає доступу' }, { status: 401 });
  }

  const { id } = await params;

  const experiment = await prisma.experiment.findUnique({
    where: { id },
    select: { slug: true, coverAssetId: true },
  });

  if (!experiment) {
    return NextResponse.json({ message: 'Експеримент не знайдено' }, { status: 404 });
  }

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

  const expectedFolder = getImageKitFolder('experiments', experiment.slug, 'cover').replace(
    /\/+$/,
    ''
  );
  const expectedPrefix = `${expectedFolder}/`;

  if (!filePath.startsWith(expectedPrefix)) {
    return NextResponse.json(
      { message: 'Файл знаходиться поза папкою цього експерименту' },
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

  const previousAssetId = experiment.coverAssetId;

  try {
    const asset = await prisma.$transaction(async (tx) => {
      const created = await tx.mediaAsset.create({
        data: {
          imageKitFileId: fileId,
          src: filePath,
          width,
          height,
        },
      });

      await tx.experiment.update({
        where: { id },
        data: { coverAssetId: created.id },
      });

      return created;
    });

    if (previousAssetId) {
      await deleteMediaAssetIfUnused(previousAssetId);
    }

    revalidateTag('experiments', 'max');

    return NextResponse.json(
      {
        cover: {
          id: asset.id,
          imageUrl: getImageUrl(asset.src),
          width: asset.width,
          height: asset.height,
        },
      },
      { status: 201 }
    );
  } catch (dbError) {
    console.error('MediaAsset create / Experiment update failed after ImageKit upload:', dbError);

    const existingAsset = await prisma.mediaAsset.findUnique({
      where: { imageKitFileId: fileId },
      select: { id: true },
    });

    if (existingAsset) {
      console.warn('Skipping compensating delete because MediaAsset already exists:', fileId);

      return NextResponse.json(
        { message: 'Цей файл уже зареєстрований у базі даних.' },
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
            'Не вдалося зберегти обкладинку до бази даних. Не вдалося автоматично видалити файл з ImageKit.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Не вдалося зберегти обкладинку до бази даних. Файл ImageKit видалено.' },
      { status: 500 }
    );
  }
}
