'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ImageLightbox, type GalleryImage } from '@/components/ImageLightbox';
import type { Photo } from '@/types/projects';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { TextLink } from '@/app/(site)/[locale]/_components/_ui/TextLink';
import { ColumnsPhotoAlbum } from 'react-photo-album';
import 'react-photo-album/columns.css';

type Props = {
  photos: Photo<string>[];
};

/**
 * Responsive columns of photos and video previews. Thumbnails open the shared
 * lightbox; captions and external links remain visible underneath each preview.
 */
export function ImagesGallery({ photos }: Props) {
  const t = useTranslations('Work');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Memoized so this array keeps a stable reference across re-renders that
  // don't touch `photos` — the lightbox resets its own current slide back to
  // its opening index whenever it receives a new slides array reference, so
  // an unstable array here silently cancels in-lightbox navigation.
  const slides: GalleryImage[] = useMemo(
    () =>
      photos.map((photo) => ({
        photo,
        caption: {
          title: photo.alt,
          subtitle: photo.description ?? undefined,
          photosCount: photos.length,
        },
      })),
    [photos]
  );

  if (photos.length === 0) {
    return null;
  }

  return (
    <div data-component="ProjectGallery">
      <ColumnsPhotoAlbum
        photos={photos}
        onClick={({ index }) => {
          setLightboxIndex(index);
        }}
        columns={(containerWidth) => {
          const columns =
            containerWidth < 480 ? 1 : containerWidth < 768 ? 2 : containerWidth < 1024 ? 3 : 4;
          return Math.min(columns, photos.length);
        }}
        spacing={16}
        render={{
          photo: ({ onClick }, { photo, index, width }) => (
            <figure className="m-0 flex w-full min-w-0 flex-col gap-1.5">
              <button
                type="button"
                onClick={onClick}
                aria-label={t(photo.mimeType?.startsWith('video/') ? 'openVideo' : 'openPhoto', {
                  index: index + 1,
                  count: photos.length,
                })}
                className="relative block w-full cursor-zoom-in"
              >
                {photo.mimeType?.startsWith('video/') ? (
                  <>
                    <video
                      src={photo.src}
                      muted
                      playsInline
                      preload="metadata"
                      width={photo.width}
                      height={photo.height}
                      aria-hidden="true"
                      className="pointer-events-none block h-auto w-full"
                      style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <Play
                        aria-hidden="true"
                        className="h-12 w-12 rounded-full bg-black/60 p-3 text-white"
                      />
                    </span>
                  </>
                ) : (
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    width={photo.width}
                    height={photo.height}
                    sizes={`${Math.ceil(width)}px`}
                    className="block h-auto w-full"
                  />
                )}
              </button>

              {(photo.description || photo.linkUrl) && (
                <figcaption className="flex flex-col gap-1 text-sm tracking-wide wrap-break-word">
                  {photo.description && <span className="text-app-muted">{photo.description}</span>}
                  {photo.linkUrl && (
                    <TextLink href={photo.linkUrl} isExternal>
                      {t('demoLabel')}
                    </TextLink>
                  )}
                </figcaption>
              )}
            </figure>
          ),
        }}
      />

      <ImageLightbox
        photos={slides}
        activeIndex={lightboxIndex}
        onCloseAction={() => setLightboxIndex(null)}
      />
    </div>
  );
}
