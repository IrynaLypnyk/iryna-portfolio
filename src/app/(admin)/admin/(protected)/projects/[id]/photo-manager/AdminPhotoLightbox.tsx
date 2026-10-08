'use client';

import { useMemo } from 'react';
import { GalleryImage, ImageLightbox } from '@/components/ImageLightbox';

type LightboxPhoto = {
  mimeType?: string | null;
  src: string;
  width: number;
  height: number;
};

type Props = {
  photos: LightboxPhoto[];
  index: number | null;
  onCloseAction: () => void;
};

export function AdminPhotoLightbox({ photos, index, onCloseAction }: Props) {
  // Memoized: the lightbox resets its current slide back to its opening index
  // whenever this array's reference changes, so an unstable array here would
  // cancel in-lightbox navigation on any unrelated re-render.
  const galleryPhotos: GalleryImage[] = useMemo(
    () =>
      photos.map((photo, photoIndex) => ({
        photo: {
          id: String(photoIndex),
          src: photo.src,
          mimeType: photo.mimeType,
          width: photo.width,
          height: photo.height,
          alt: '',
          linkUrl: null,
          description: null,
        },
      })),
    [photos]
  );

  return (
    <ImageLightbox
      photos={galleryPhotos}
      activeIndex={index}
      onCloseAction={onCloseAction}
      showCaptions={false}
      showThumbnails={false}
    />
  );
}
