import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

type ReorderItem = {
  id: string;
  orderInProject: number;
};

function validateReorderInput(
  body: unknown
): { data: ReorderItem[]; error?: undefined } | { data?: undefined; error: string } {
  if (!Array.isArray(body) || body.length === 0) {
    return { error: 'Очікується непорожній масив' };
  }

  for (const item of body) {
    if (typeof item !== 'object' || item === null) {
      return { error: "Кожен елемент має бути об'єктом" };
    }

    const { id, orderInProject } = item as Record<string, unknown>;

    if (typeof id !== 'string' || id.trim() === '') {
      return { error: 'id має бути непорожнім рядком' };
    }

    if (typeof orderInProject !== 'number' || !Number.isInteger(orderInProject)) {
      return { error: 'orderInProject має бути цілим числом' };
    }
  }

  return { data: body as ReorderItem[] };
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ message: 'Немає доступу' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const result = validateReorderInput(body);

  if ('error' in result) {
    return NextResponse.json({ message: result.error }, { status: 400 });
  }

  try {
    // Fetch one photo to get the project slug for cache invalidation.
    const firstPhoto = await prisma.photo.findUnique({
      where: { id: result.data[0].id },
      select: { project: { select: { slug: true } } },
    });

    await prisma.$transaction(
      result.data.map(({ id, orderInProject }) =>
        prisma.photo.update({
          where: { id },
          data: { orderInProject },
        })
      )
    );

    revalidateTag('projects', 'max');
    if (firstPhoto?.project.slug) {
      revalidateTag(`project-${firstPhoto.project.slug}`, 'max');
    }

    return NextResponse.json({ message: 'Порядок збережено' });
  } catch (error) {
    console.error('Failed to reorder photos:', error);
    return NextResponse.json({ message: 'Не вдалося зберегти порядок' }, { status: 500 });
  }
}
