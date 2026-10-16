import type { Prisma } from '@/generated/prisma/client';

/** Every reference path must be empty before physical cleanup is considered. */
export function unusedMediaAssetWhere(id: string): Prisma.MediaAssetWhereInput {
  return {
    id,
    defaultForPhotos: { none: {} },
    ukrainianForPhotos: { none: {} },
    projectCovers: { none: {} },
    projectCoversUk: { none: {} },
    experimentCovers: { none: {} },
    experimentCoversUk: { none: {} },
  };
}
