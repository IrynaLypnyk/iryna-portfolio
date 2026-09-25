import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateExperimentInput } from '../validation';
import { isRecordNotFoundError, isUniqueConstraintError } from '@/lib/api/prisma-errors';
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
  const result = validateExperimentInput(body);

  if ('error' in result) {
    return NextResponse.json({ message: result.error }, { status: 400 });
  }

  try {
    const experiment = await prisma.experiment.update({ where: { id }, data: result.data });

    revalidateTag('experiments', 'max');

    return NextResponse.json({ experiment });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json({ message: 'Експеримент з таким slug вже існує' }, { status: 409 });
    }

    if (isRecordNotFoundError(error)) {
      return NextResponse.json({ message: 'Експеримент не знайдено' }, { status: 404 });
    }

    console.error('Failed to update experiment:', error);
    return NextResponse.json({ message: 'Не вдалося оновити експеримент' }, { status: 500 });
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
    // `coverAsset` uses onDelete: SetNull, so deleting the Experiment doesn't
    // touch the MediaAsset row — clean it up explicitly if nothing else uses it.
    const experiment = await prisma.experiment.delete({ where: { id } });

    if (experiment.coverAssetId) {
      await deleteMediaAssetIfUnused(experiment.coverAssetId);
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
