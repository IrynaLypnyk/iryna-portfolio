import type { MediaAsset, Photo as DbPhoto, ContentBlock } from '@/generated/prisma/client';
import type { LocaleType } from '@/i18n/routing';
import type { Photo, CaseBlock } from '@/types/projects';
import { getImageUrl } from '@/lib/imagekit/get-image-url';
import { nullableText } from '@/lib/content/text';

export type PublicPhoto = DbPhoto & { asset: MediaAsset; assetUk: MediaAsset | null };
export type PublicBlock = ContentBlock & { photos: PublicPhoto[] };
export const detailPublished = { published: true, detailPageStatus: 'PUBLISHED' as const };
export const publicPhotos = {
  where: { contentBlockId: null, isProjectCover: false },
  orderBy: [{ orderInProject: 'asc' as const }, { id: 'asc' as const }],
  include: { asset: true, assetUk: true },
};
export const publicBlocks = {
  orderBy: [{ order: 'asc' as const }, { id: 'asc' as const }],
  include: {
    photos: {
      orderBy: [{ orderInProject: 'asc' as const }, { id: 'asc' as const }],
      include: { asset: true, assetUk: true },
    },
  },
};
export function localized(locale: LocaleType, uk: string | null, en: string | null) {
  return nullableText(locale === 'uk' ? uk : en);
}
export function assetPhoto(asset: MediaAsset, title: string): Photo<string> {
  return {
    id: asset.id,
    src: getImageUrl(asset.src),
    mimeType: asset.mimeType,
    width: asset.width,
    height: asset.height,
    alt: title,
    description: null,
    linkUrl: null,
  };
}
export function coverPhoto(
  owner: { coverAsset?: MediaAsset | null; coverAssetUk?: MediaAsset | null },
  locale: LocaleType,
  title: string
) {
  if (!owner.coverAsset) return null;
  const asset = locale === 'uk' ? (owner.coverAssetUk ?? owner.coverAsset) : owner.coverAsset;
  return assetPhoto(asset, title);
}
export function usagePhoto(photo: PublicPhoto, locale: LocaleType, title: string): Photo<string> {
  const asset = locale === 'uk' ? (photo.assetUk ?? photo.asset) : photo.asset;
  return {
    ...assetPhoto(asset, title),
    id: photo.id,
    alt: localized(locale, photo.captionUk, photo.captionEn) ?? title,
    description: localized(locale, photo.descriptionUk, photo.descriptionEn),
    linkUrl: photo.linkUrl,
  };
}
export function contentBlocks(
  blocks: PublicBlock[] = [],
  locale: LocaleType,
  title: string
): CaseBlock[] {
  return blocks
    .map((block) => ({
      id: block.id,
      title: localized(locale, block.titleUk, block.titleEn),
      body: localized(locale, block.bodyUk, block.bodyEn),
      photos: block.photos.map((photo) => usagePhoto(photo, locale, title)),
    }))
    .filter((block) => block.title || block.body || block.photos.length)
    .map((block, index) => ({ ...block, index: String(index + 1).padStart(2, '0') }));
}
