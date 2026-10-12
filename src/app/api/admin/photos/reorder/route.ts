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

    if (
      typeof orderInProject !== 'number' ||
      !Number.isInteger(orderInProject) ||
      orderInProject < 0
    ) {
      return { error: 'orderInProject має бути цілим числом' };
    }
  }

  if (new Set(body.map((item) => item.id)).size !== body.length) {
    return { error: 'Медіафайли не мають повторюватися' };
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
    const ownerPhoto = await prisma.$transaction(async (tx) => {
      const photos = await tx.photo.findMany({
        where: { id: { in: result.data.map((item) => item.id) } },
        select: { projectId: true, experimentId: true, project: { select: { slug: true } } },
      });
      const first = photos[0];
      if (
        !first ||
        photos.length !== result.data.length ||
        photos.some(
          (photo) =>
            photo.projectId !== first.projectId || photo.experimentId !== first.experimentId
        )
      ) {
        throw new Error('INVALID_MEDIA_ORDER');
      }
      for (const { id, orderInProject } of result.data) {
        await tx.photo.update({ where: { id }, data: { orderInProject } });
      }
      return first;
    });

    if (ownerPhoto.project) {
      revalidateTag('projects', 'max');
      revalidateTag(`project-${ownerPhoto.project.slug}`, 'max');
    } else {
      revalidateTag('experiments', 'max');
    }

    return NextResponse.json({ message: 'Порядок збережено' });
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_MEDIA_ORDER') {
      return NextResponse.json(
        { message: 'Медіафайли мають належати одному проєкту або експерименту' },
        { status: 400 }
      );
    }
    console.error('Failed to reorder photos:', error);
    return NextResponse.json({ message: 'Не вдалося зберегти порядок' }, { status: 500 });
  }
}
