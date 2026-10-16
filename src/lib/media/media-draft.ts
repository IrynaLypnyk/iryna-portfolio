import type { PhotoInput } from '@/lib/content/validation';

export type MediaAssetPreview = {
  id: string;
  imageUrl: string;
  mimeType: string | null;
  width: number;
  height: number;
};

/** key survives form saves; id is absent until the Photo usage is saved. */
export type MediaDraft = {
  key: string;
  id?: string;
  asset: MediaAssetPreview;
  assetUk: MediaAssetPreview | null;
  captionEn: string | null;
  captionUk: string | null;
  descriptionEn: string | null;
  descriptionUk: string | null;
  linkUrl: string | null;
  legacyCover: boolean;
};

export function newMediaDraft(asset: MediaAssetPreview, key: string): MediaDraft {
  return {
    key,
    asset,
    assetUk: null,
    captionEn: null,
    captionUk: null,
    descriptionEn: null,
    descriptionUk: null,
    linkUrl: null,
    legacyCover: false,
  };
}

export function mediaInput(items: MediaDraft[]): PhotoInput[] {
  return items.map(
    ({ id, asset, assetUk, captionEn, captionUk, descriptionEn, descriptionUk, linkUrl }) => ({
      ...(id ? { id } : {}),
      assetId: asset.id,
      assetUkId: assetUk?.id ?? null,
      captionEn,
      captionUk,
      descriptionEn,
      descriptionUk,
      linkUrl,
    })
  );
}

export function mediaMime(asset: { mimeType?: string | null; imageUrl: string }) {
  return (
    asset.mimeType ||
    (/\.webm(?:[?#]|$)/i.test(asset.imageUrl)
      ? 'video/webm'
      : /\.mp4(?:[?#]|$)/i.test(asset.imageUrl)
        ? 'video/mp4'
        : null)
  );
}

export function reconcileMediaIds(
  current: MediaDraft[],
  submitted: MediaDraft[],
  saved: { id: string }[]
) {
  const ids = new Map(submitted.map((item, index) => [item.key, saved[index]?.id]));
  return current.map((item) => (ids.get(item.key) ? { ...item, id: ids.get(item.key) } : item));
}
