import { prisma } from '@/lib/prisma';
import { getImageKit } from '@/lib/imagekit/client';
import { assertSafeImageKitPath } from '@/lib/imagekit/assertSafeImageKitPath';
import { unusedMediaAssetWhere } from './unused-media-asset';
import { withMediaFileLock } from './file-lock';

function isMissingFile(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'status' in error && error.status === 404;
}

export async function deleteMediaAssetIfUnused(assetId: string): Promise<{ deleted: boolean }> {
  const unusedAsset = unusedMediaAssetWhere(assetId);
  const asset = await prisma.mediaAsset.findFirst({
    where: unusedAsset,
    select: { imageKitFileId: true },
  });

  if (!asset) return { deleted: false };

  return withMediaFileLock(asset.imageKitFileId, async () => {
    const imageKit = getImageKit();
    let fileExists = true;

    try {
      const file = await imageKit.files.get(asset.imageKitFileId, {
        timeout: 10_000,
        maxRetries: 0,
      });
      if (!file.filePath) throw new Error('ImageKit file path is missing');
      assertSafeImageKitPath(file.filePath);
    } catch (error) {
      if (!isMissingFile(error)) throw error;
      fileExists = false;
    }

    // Commit the conditional deletion before touching ImageKit. Restrictive
    // FKs arbitrate concurrent attachments; a failed DB write never deletes a
    // file. Registration holds the same file lock and re-verifies ImageKit.
    const result = await prisma.mediaAsset.deleteMany({ where: unusedAsset });
    if (result.count === 0) return { deleted: false };

    if (fileExists) {
      try {
        await imageKit.files.delete(asset.imageKitFileId, { timeout: 10_000, maxRetries: 0 });
      } catch (error) {
        if (!isMissingFile(error)) {
          console.error('Unused ImageKit file needs manual retry:', asset.imageKitFileId, error);
          throw error;
        }
      }
    }

    return { deleted: true };
  });
}

/** Cleanup is best-effort after a committed save, never a second content save. */
export async function cleanupMediaAssets(assetIds: (string | null)[]) {
  const failedAssetIds: string[] = [];
  const deletedAssetIds: string[] = [];
  for (const id of new Set(assetIds)) {
    if (!id) continue;
    try {
      if ((await deleteMediaAssetIfUnused(id)).deleted) deletedAssetIds.push(id);
    } catch (error) {
      failedAssetIds.push(id);
      console.error('Content saved; unused media cleanup failed:', id, error);
    }
  }
  return { failedAssetIds, deletedAssetIds };
}
