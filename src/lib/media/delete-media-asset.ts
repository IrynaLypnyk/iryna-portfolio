import { prisma } from '@/lib/prisma';
import { getImageKit } from '@/lib/imagekit/client';
import { assertSafeImageKitPath } from '@/lib/imagekit/assertSafeImageKitPath';

function isMissingFile(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'status' in error && error.status === 404;
}

export async function deleteMediaAssetIfUnused(assetId: string): Promise<{ deleted: boolean }> {
  const unusedAsset = {
    id: assetId,
    defaultForPhotos: { none: {} },
    ukrainianForPhotos: { none: {} },
  };
  const asset = await prisma.mediaAsset.findFirst({
    where: unusedAsset,
    select: { imageKitFileId: true },
  });

  if (!asset) return { deleted: false };

  const imageKit = getImageKit();
  let fileExists = true;

  try {
    const file = await imageKit.files.get(asset.imageKitFileId);
    if (!file.filePath) throw new Error('ImageKit file path is missing');
    assertSafeImageKitPath(file.filePath);
  } catch (error) {
    if (!isMissingFile(error)) throw error;
    fileExists = false;
  }

  return prisma.$transaction(
    async (tx) => {
      // Recheck usage atomically. Foreign keys prevent new references while
      // this deletion is pending; an ImageKit failure rolls back the DB deletion.
      const result = await tx.mediaAsset.deleteMany({ where: unusedAsset });
      if (result.count === 0) return { deleted: false };

      if (fileExists) {
        try {
          await imageKit.files.delete(asset.imageKitFileId, { timeout: 10_000, maxRetries: 0 });
        } catch (error) {
          if (!isMissingFile(error)) throw error;
        }
      }

      return { deleted: true };
    },
    { timeout: 15_000 }
  );
}
