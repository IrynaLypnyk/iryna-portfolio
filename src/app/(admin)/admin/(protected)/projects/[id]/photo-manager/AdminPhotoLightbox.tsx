'use client';

import { GalleryImage, ImageLightbox } from '@/components/ImageLightbox';

type LightboxPhoto = {
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
  const galleryPhotos: GalleryImage[] = photos.map((photo, photoIndex) => ({
    photo: {
      id: String(photoIndex),
      src: photo.src,
      width: photo.width,
      height: photo.height,
      alt: '',
    },
  }));

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
