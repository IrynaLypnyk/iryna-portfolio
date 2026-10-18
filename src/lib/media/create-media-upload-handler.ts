import { NextRequest, NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth';
import { assertSafeImageKitPath } from '@/lib/imagekit/assertSafeImageKitPath';
import { getImageKit } from '@/lib/imagekit/client';
import { getImageUrl } from '@/lib/imagekit/get-image-url';
import { getImageKitFolder } from '@/lib/imagekit/getImageKitFolder';
import { prisma } from '@/lib/prisma';
import { getProjectMediaValidationError, isVideo } from '@/lib/media/project-media-policy';

type Params = {
  params: Promise<{ id: string }>;
};

/** Finalizes browser uploads for either a project or an experiment.
 * Uses authoritative ImageKit metadata. Failed registration retains the uploaded file for retry.
 */
export function createMediaUploadHandler(ownerType: 'projects' | 'experiments') {
  return async function POST(request: NextRequest, { params }: Params) {
    try {
      await requireAuth();
    } catch {
      return NextResponse.json({ message: 'Немає доступу' }, { status: 401 });
    }

    const { id } = await params;

    // ── 1. Verify owner exists ──────────────────────────────────────────────
    const query = { where: { id }, select: { slug: true } };
    const record =
      ownerType === 'projects'
        ? await prisma.project.findUnique(query)
        : await prisma.experiment.findUnique(query);

    if (!record) {
      return NextResponse.json({ message: 'Запис не знайдено' }, { status: 404 });
    }

    // ── 2. Parse fileId ───────────────────────────────────────────────────────
    let body: { fileId?: string };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: 'Неправильний формат запиту' }, { status: 400 });
    }

    const fileId = typeof body?.fileId === 'string' ? body.fileId.trim() : '';

    if (!fileId) {
      return NextResponse.json({ message: 'ImageKit fileId не передано' }, { status: 400 });
    }

    const imageKit = getImageKit();

    let imageKitFile: Awaited<ReturnType<typeof imageKit.files.get>>;

    try {
      imageKitFile = await imageKit.files.get(fileId, { timeout: 10_000, maxRetries: 0 });
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

    if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
      return NextResponse.json({ message: 'Некоректні розміри медіафайлу' }, { status: 400 });
    }

    const expectedFolder = getImageKitFolder(ownerType, record.slug, 'photos').replace(/\/+$/, '');

    const expectedPrefix = `${expectedFolder}/`;

    if (!filePath.startsWith(expectedPrefix)) {
      return NextResponse.json(
        { message: 'Файл знаходиться поза папкою цього запису' },
        { status: 400 }
      );
    }

    try {
      assertSafeImageKitPath(filePath);
    } catch {
      return NextResponse.json({ message: 'Небезпечний ImageKit path' }, { status: 400 });
    }

    const mediaError =
      fileType !== 'image' && !isVideo(mime)
        ? 'Непідтримуваний тип медіафайлу'
        : getProjectMediaValidationError(mime, size);
    if (mediaError) {
      return NextResponse.json({ message: mediaError }, { status: 400 });
    }

    // Register only. Photo usage, context and ordering belong to the form save.
    try {
      const asset = await prisma.mediaAsset.upsert({
        where: { imageKitFileId: fileId },
        update: {},
        create: {
          imageKitFileId: fileId,
          src: filePath,
          mimeType: mime,
          width,
          height,
        },
      });

      return NextResponse.json(
        {
          asset: {
            id: asset.id,
            imageUrl: getImageUrl(asset.src),
            mimeType: asset.mimeType,
            width: asset.width,
            height: asset.height,
          },
        },
        { status: 201 }
      );
    } catch (dbError) {
      console.error('MediaAsset registration failed after ImageKit upload:', dbError);

      // Never compensate with remote deletion: a concurrent request may have
      // registered or attached this file. The unique file ID makes retry safe.
      return NextResponse.json(
        { message: 'Не вдалося зберегти медіафайл. Файл збережено в ImageKit; повторіть спробу.' },
        { status: 500 }
      );
    }
  };
}
