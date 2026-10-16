import { NextResponse } from 'next/server';
import { isRecordNotFoundError, isUniqueConstraintError } from '@/lib/api/prisma-errors';
import { ContentSaveError } from './save';

export function contentSaveErrorResponse(error: unknown, kind: 'Project' | 'Experiment') {
  if (error instanceof ContentSaveError) {
    return NextResponse.json({ message: error.message, field: error.field }, { status: 400 });
  }
  if (isUniqueConstraintError(error)) {
    return NextResponse.json(
      { message: `${kind} with this slug already exists.`, field: 'slug' },
      { status: 409 }
    );
  }
  if (isRecordNotFoundError(error)) {
    return NextResponse.json({ message: `${kind} not found.` }, { status: 404 });
  }
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2034') {
    return NextResponse.json(
      { message: 'Another save changed this content. Reload and retry.' },
      { status: 409 }
    );
  }
  console.error(`Failed to save ${kind}:`, error);
  return NextResponse.json({ message: `Could not save ${kind.toLowerCase()}.` }, { status: 500 });
}
