import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validatePhotoUpdateInput } from '../validation';
import { isRecordNotFoundError } from '@/lib/api/prisma-errors';
import { deleteMediaAssetIfUnused } from '@/lib/media/delete-media-asset';

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ message: 'Немає доступу' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const result = validatePhotoUpdateInput(body);

  if ('error' in result) {
    return NextResponse.json({ message: result.error }, { status: 400 });
  }

  try {
    const photo = await prisma.$transaction(async (tx) => {
      // Fetch the current record so we know which project to scope
      // sibling queries to. findUniqueOrThrow emits a P2025
      // PrismaClientKnownRequestError if missing, which the outer catch
      // maps to a 404 response via isRecordNotFoundError.
      const current = await tx.photo.findUniqueOrThrow({
        where: { id },
        select: { projectId: true },
      });

      const { projectId } = current;

      // ── Cover uniqueness ──────────────────────────────────────────────────
      // When the cover flag is being set on this photo, demote every sibling
      // so "at most one cover per project" holds atomically, without requiring
      // two round-trips from the client.
      if (result.data.isProjectCover) {
        await tx.photo.updateMany({
          where: { projectId, id: { not: id } },
          data: { isProjectCover: false },
        });
      }

      return tx.photo.update({
        where: { id },
        data: result.data,
        include: { project: { select: { slug: true } } },
      });
    });

    revalidateTag('projects', 'max');
    revalidateTag(`project-${photo.project.slug}`, 'max');

    return NextResponse.json({ photo });
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      return NextResponse.json({ message: 'Фото не знайдено' }, { status: 404 });
    }

    console.error('Failed to update photo:', error);
    return NextResponse.json({ message: 'Не вдалося оновити фото' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ message: 'Немає доступу' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Delete the project-specific usage first.
    // The MediaAsset and physical ImageKit file are handled separately below.
    const photo = await prisma.photo.delete({
      where: { id },
      select: {
        assetId: true,
        project: {
          select: {
            slug: true,
          },
        },
      },
    });

    const assetResult = await deleteMediaAssetIfUnused(photo.assetId);

    revalidateTag('projects', 'max');
    revalidateTag(`project-${photo.project.slug}`, 'max');

    return NextResponse.json({
      message: 'Видалено',
      assetDeleted: assetResult.deleted,
    });
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      return NextResponse.json({ message: 'Фото не знайдено' }, { status: 404 });
    }

    console.error('Failed to delete photo:', error);

    return NextResponse.json({ message: 'Не вдалося видалити фото' }, { status: 500 });
  }
}
