import type { Prisma } from '@/generated/prisma/client';
import { getImageUrl } from '@/lib/imagekit/get-image-url';
import type { MediaAssetPreview, MediaDraft } from './media-draft';
import type { OwnerMediaDraft } from './owner-media-draft';

type Photo = Prisma.PhotoGetPayload<{ include: { asset: true; assetUk: true } }>;
type Block = Prisma.ContentBlockGetPayload<{
  include: { photos: { include: { asset: true; assetUk: true } } };
}>;
function preview(asset: Photo['asset']): MediaAssetPreview {
  return {
    id: asset.id,
    imageUrl: getImageUrl(asset.src),
    mimeType: asset.mimeType,
    width: asset.width,
    height: asset.height,
  };
}
function draft(photo: Photo): MediaDraft {
  return {
    key: photo.id,
    id: photo.id,
    asset: preview(photo.asset),
    assetUk: photo.assetUk ? preview(photo.assetUk) : null,
    captionEn: photo.captionEn,
    captionUk: photo.captionUk,
    descriptionEn: photo.descriptionEn,
    descriptionUk: photo.descriptionUk,
    linkUrl: photo.linkUrl,
    legacyCover: photo.isProjectCover,
  };
}
export function adminMediaDraft(owner: {
  photos: Photo[];
  contentBlocks: Block[];
}): OwnerMediaDraft {
  return {
    additionalMedia: owner.photos.filter((photo) => photo.contentBlockId === null).map(draft),
    contentBlocks: owner.contentBlocks.map((block) => ({
      key: block.id,
      id: block.id,
      titleEn: block.titleEn,
      titleUk: block.titleUk,
      bodyEn: block.bodyEn,
      bodyUk: block.bodyUk,
      photos: block.photos.map(draft),
    })),
  };
}
