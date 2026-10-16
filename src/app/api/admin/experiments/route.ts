import { cleanupMediaAssets } from '@/lib/media/delete-media-asset';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { saveExperiment } from '@/lib/content/save';
import { contentSaveErrorResponse } from '@/lib/content/http';

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ message: 'Немає доступу' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  try {
    const saved = await saveExperiment(prisma, body);
    revalidateTag('experiments', { expire: 0 });

    const cleanup = await cleanupMediaAssets(saved.cleanupCandidateAssetIds);
    return NextResponse.json(
      {
        experiment: saved.experiment,
        cleanupCandidateAssetIds: saved.cleanupCandidateAssetIds,
        cleanup,
      },
      { status: 201 }
    );
  } catch (error) {
    return contentSaveErrorResponse(error, 'Experiment');
  }
}
