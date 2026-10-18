/**
 * Automatic asset cleanup is intentionally deferred. Keep both MediaAsset rows
 * and ImageKit files so concurrent registration/reuse cannot lose a file after
 * a reference check. Photo removal still commits through the normal save flow.
 *
 * Resume physical cleanup only through a separately reviewed maintenance process
 * with writes paused and all Photo/default/UK cover references checked again.
 */
export async function cleanupMediaAssets(assetIds: (string | null)[]) {
  return {
    failedAssetIds: [] as string[],
    deletedAssetIds: [] as string[],
    deferredAssetIds: [...new Set(assetIds.filter((id): id is string => Boolean(id)))],
  };
}
