import {
  mediaInput,
  reconcileMediaIds,
  type MediaDraft,
  type MediaAssetPreview,
} from './media-draft';

export type BlockMediaDraft = {
  key: string;
  id?: string;
  titleEn: string | null;
  titleUk: string | null;
  bodyEn: string | null;
  bodyUk: string | null;
  photos: MediaDraft[];
};
export type OwnerMediaDraft = {
  additionalMedia: MediaDraft[];
  contentBlocks: BlockMediaDraft[];
  coverAsset?: MediaAssetPreview | null;
  coverAssetUk?: MediaAssetPreview | null;
};

export function newContentBlock(key: string): BlockMediaDraft {
  return { key, titleEn: null, titleUk: null, bodyEn: null, bodyUk: null, photos: [] };
}

export function moveContentBlock(blocks: BlockMediaDraft[], key: string, direction: -1 | 1) {
  const index = blocks.findIndex((block) => block.key === key);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= blocks.length) return blocks;
  const next = [...blocks];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
export type SavedOwnerMedia = {
  photos: { id: string; contentBlockId: string | null }[];
  contentBlocks: { id: string; photos: { id: string }[] }[];
};

export function ownerMediaInput(media: OwnerMediaDraft) {
  return {
    ...(media.coverAsset !== undefined ? { coverAssetId: media.coverAsset?.id ?? null } : {}),
    ...(media.coverAssetUk !== undefined ? { coverAssetUkId: media.coverAssetUk?.id ?? null } : {}),
    additionalMedia: mediaInput(media.additionalMedia),
    contentBlocks: media.contentBlocks.map(({ id, titleEn, titleUk, bodyEn, bodyUk, photos }) => ({
      ...(id ? { id } : {}),
      titleEn,
      titleUk,
      bodyEn,
      bodyUk,
      photos: mediaInput(photos),
    })),
  };
}

export function mediaSnapshot(media: OwnerMediaDraft) {
  // Stable draft keys detect ordering changes even for identical blocks/usages.
  // Database IDs are excluded so reconciling a successful save stays clean.
  return JSON.stringify(
    {
      ...ownerMediaInput(media),
      blockKeys: media.contentBlocks.map((block) => [
        block.key,
        ...block.photos.map((photo) => photo.key),
      ]),
      additionalKeys: media.additionalMedia.map((photo) => photo.key),
    },
    (key, value) => (key === 'id' ? undefined : value)
  );
}

export function reconcileOwnerMedia(
  current: OwnerMediaDraft,
  submitted: OwnerMediaDraft,
  saved: SavedOwnerMedia
): OwnerMediaDraft {
  return {
    ...current,
    additionalMedia: reconcileMediaIds(
      current.additionalMedia,
      submitted.additionalMedia,
      saved.photos.filter((photo) => photo.contentBlockId === null)
    ),
    contentBlocks: current.contentBlocks.map((block) => {
      const index = submitted.contentBlocks.findIndex((item) => item.key === block.key);
      const savedBlock = saved.contentBlocks[index];
      return index < 0 || !savedBlock
        ? block
        : {
            ...block,
            id: savedBlock.id,
            photos: reconcileMediaIds(
              block.photos,
              submitted.contentBlocks[index].photos,
              savedBlock.photos
            ),
          };
    }),
  };
}
