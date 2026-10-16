import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { saveExperiment } from '@/lib/content/save';
import { contentSaveErrorResponse } from '@/lib/content/http';
import { isRecordNotFoundError } from '@/lib/api/prisma-errors';
import { deleteMediaAssetIfUnused } from '@/lib/media/delete-media-asset';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ message: 'Немає доступу' }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => null);
  try {
    const saved = await saveExperiment(prisma, body, id);
    revalidateTag('experiments', { expire: 0 });

    return NextResponse.json({
      experiment: saved.experiment,
      cleanupCandidateAssetIds: saved.cleanupCandidateAssetIds,
    });
  } catch (error) {
    return contentSaveErrorResponse(error, 'Experiment');
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
    const experiment = await prisma.experiment.delete({
      where: { id },
      include: { photos: { select: { assetId: true, assetUkId: true } } },
    });
    const assetIds = new Set(
      experiment.photos.flatMap((photo) => [photo.assetId, photo.assetUkId])
    );
    revalidateTag('experiments', 'max');
    for (const assetId of assetIds) {
      if (assetId) await deleteMediaAssetIfUnused(assetId);
    }

    revalidateTag('experiments', 'max');

    return NextResponse.json({ message: 'Видалено' });
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      return NextResponse.json({ message: 'Експеримент не знайдено' }, { status: 404 });
    }

    console.error('Failed to delete experiment:', error);
    return NextResponse.json({ message: 'Не вдалося видалити експеримент' }, { status: 500 });
  }
}
