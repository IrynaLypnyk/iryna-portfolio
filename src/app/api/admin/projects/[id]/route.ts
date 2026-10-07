import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateProjectInput } from '../validation';
import { isRecordNotFoundError, isUniqueConstraintError } from '@/lib/api/prisma-errors';

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
  const result = validateProjectInput(body);

  if ('error' in result) {
    return NextResponse.json({ message: result.error, field: result.field }, { status: 400 });
  }

  const { sections, ...fields } = result.data;

  try {
    const existing = await prisma.project.findUnique({ where: { id }, select: { slug: true } });

    // Sections are positional content, so the incoming array replaces the
    // stored set outright — a positional merge would silently reorder text.
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...fields,
        sections: {
          deleteMany: {},
          create: sections.map((section, index) => ({ ...section, order: index + 1 })),
        },
      },
    });

    revalidateTag('projects', 'max');
    revalidateTag(`project-${project.slug}`, 'max');

    if (existing && existing.slug !== project.slug) {
      revalidateTag(`project-${existing.slug}`, 'max');
    }

    return NextResponse.json({ project });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { message: 'Проєкт з таким slug вже існує', field: 'slug' },
        { status: 409 }
      );
    }

    if (isRecordNotFoundError(error)) {
      return NextResponse.json({ message: 'Проєкт не знайдено' }, { status: 404 });
    }

    console.error('Failed to update project:', error);
    return NextResponse.json({ message: 'Не вдалося оновити проєкт' }, { status: 500 });
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
