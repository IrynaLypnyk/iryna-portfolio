import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { saveProject } from '@/lib/content/save';
import { contentSaveErrorResponse } from '@/lib/content/http';
import { isRecordNotFoundError } from '@/lib/api/prisma-errors';

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
    const saved = await saveProject(prisma, body, id);
    revalidateTag('projects', { expire: 0 });
    revalidateTag(`project-${saved.project.slug}`, { expire: 0 });
    if (saved.previousSlug && saved.previousSlug !== saved.project.slug) {
      revalidateTag(`project-${saved.previousSlug}`, { expire: 0 });
    }
    return NextResponse.json({
      project: saved.project,
      cleanupCandidateAssetIds: saved.cleanupCandidateAssetIds,
    });
  } catch (error) {
    return contentSaveErrorResponse(error, 'Project');
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
    // Photo.project uses onDelete: Cascade, so this also deletes all of the
    // project's Photo rows (not the underlying ImageKit files).
    const project = await prisma.project.delete({ where: { id } });

    revalidateTag('projects', 'max');
    revalidateTag(`project-${project.slug}`, 'max');

    return NextResponse.json({ message: 'Видалено' });
  } catch (error) {
    if (isRecordNotFoundError(error)) {
      return NextResponse.json({ message: 'Проєкт не знайдено' }, { status: 404 });
    }

    console.error('Failed to delete project:', error);
    return NextResponse.json({ message: 'Не вдалося видалити проєкт' }, { status: 500 });
  }
}
