import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateExperimentInput } from './validation';
import { isUniqueConstraintError } from '@/lib/api/prisma-errors';

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ message: 'Немає доступу' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const result = validateExperimentInput(body);

  if ('error' in result) {
    return NextResponse.json({ message: result.error }, { status: 400 });
  }

  try {
    const experiment = await prisma.experiment.create({ data: result.data });

    revalidateTag('experiments', 'max');

    return NextResponse.json({ experiment }, { status: 201 });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json({ message: 'Експеримент з таким slug вже існує' }, { status: 409 });
    }

    console.error('Failed to create experiment:', error);
    return NextResponse.json({ message: 'Не вдалося створити експеримент' }, { status: 500 });
  }
}
