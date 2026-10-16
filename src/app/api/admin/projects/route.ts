import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { saveProject } from '@/lib/content/save';
import { contentSaveErrorResponse } from '@/lib/content/http';

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ message: 'Немає доступу' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  try {
    const saved = await saveProject(prisma, body);
    revalidateTag('projects', { expire: 0 });
    revalidateTag(`project-${saved.project.slug}`, { expire: 0 });

    return NextResponse.json(
      {
        project: saved.project,
        cleanupCandidateAssetIds: saved.cleanupCandidateAssetIds,
      },
      { status: 201 }
    );
  } catch (error) {
    return contentSaveErrorResponse(error, 'Project');
  }
}
