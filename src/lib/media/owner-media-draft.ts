import { mediaInput, reconcileMediaIds, type MediaDraft } from './media-draft';

export type BlockMediaDraft = {
  key: string;
  id?: string;
  titleEn: string | null;
  titleUk: string | null;
  bodyEn: string | null;
  bodyUk: string | null;
  photos: MediaDraft[];
};
export type OwnerMediaDraft = { additionalMedia: MediaDraft[]; contentBlocks: BlockMediaDraft[] };
export type SavedOwnerMedia = {
  photos: { id: string; contentBlockId: string | null }[];
  contentBlocks: { id: string; photos: { id: string }[] }[];
};

export function ownerMediaInput(media: OwnerMediaDraft) {
  return {
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
  return JSON.stringify(ownerMediaInput(media), (key, value) => (key === 'id' ? undefined : value));
}

export function reconcileOwnerMedia(
  current: OwnerMediaDraft,
  submitted: OwnerMediaDraft,
  saved: SavedOwnerMedia
): OwnerMediaDraft {
  return {
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
