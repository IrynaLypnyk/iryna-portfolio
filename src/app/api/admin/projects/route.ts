import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateProjectInput } from './validation';
import { isUniqueConstraintError } from '@/lib/api/prisma-errors';

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ message: 'Немає доступу' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const result = validateProjectInput(body);

  if ('error' in result) {
    return NextResponse.json({ message: result.error, field: result.field }, { status: 400 });
  }

  const { sections, ...fields } = result.data;

  try {
    const project = await prisma.project.create({
      data: {
        ...fields,
        sections: {
          create: sections.map((section, index) => ({ ...section, order: index + 1 })),
        },
      },
    });

    revalidateTag('projects', 'max');

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { message: 'Проєкт з таким slug вже існує', field: 'slug' },
        { status: 409 }
      );
    }

    console.error('Failed to create project:', error);
    return NextResponse.json({ message: 'Не вдалося створити проєкт' }, { status: 500 });
  }
}
