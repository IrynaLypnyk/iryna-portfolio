'use client';

import { useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AppLink } from './AppLink';
import { ImageLightbox, type GalleryImage } from '@/components/ImageLightbox';
import type { Photo } from '@/types/projects';
import Image from 'next/image';

type Props = {
  photos: Photo<string>[];
};

/**
 * Horizontal swipeable strip of screenshots shown inside an expanded project
 * card. Clicking a thumbnail opens it in the shared `ImageLightbox`; the
 * caption/link for a photo sits underneath it rather than on hover, since
 * hover has no equivalent on touch devices.
 */
export function ProjectGallery({ photos }: Props) {
  const t = useTranslations('Work');
  const trackRef = useRef<HTMLDivElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  function scrollBy(direction: -1 | 1) {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    track.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: 'smooth' });
  }

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
    <div data-component="ProjectGallery" className="grid gap-3">
      <div
        ref={trackRef}
        className="scrollbar-hide flex snap-x snap-mandatory items-start gap-3 overflow-x-auto pb-1"
      >
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="flex max-w-107.5 min-w-0 shrink-0 snap-start flex-col gap-1.5"
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(index)}
              aria-label={t('openPhoto', { index: index + 1, count: photos.length })}
              className="cursor-zoom-in"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                className="h-75 w-auto"
              />
            </button>

            {(photo.description || photo.linkUrl) && (
              <>
                {photo.description && (
                  <p className="text-app-muted max-w-full leading-snug">{photo.description}</p>
                )}

                {photo.linkUrl && (
                  <AppLink href={photo.linkUrl} external arrow="right" color="blueBright">
                    {t('demoLabel')}
                  </AppLink>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/*{photos.length > 1 && (*/}
      {/*  <div className="flex gap-2">*/}
      {/*    <button*/}
      {/*      type="button"*/}
      {/*      aria-label={t('galleryPrev')}*/}
      {/*      onClick={() => scrollBy(-1)}*/}
      {/*      className="border-app-line text-app-muted hover:border-app-accent hover:text-app-accent flex h-8 w-8 items-center justify-center border transition-colors"*/}
      {/*    >*/}
      {/*      <ChevronLeft size={16} strokeWidth={1.75} />*/}
      {/*    </button>*/}
      {/*    <button*/}
      {/*      type="button"*/}
      {/*      aria-label={t('galleryNext')}*/}
      {/*      onClick={() => scrollBy(1)}*/}
      {/*      className="border-app-line text-app-muted hover:border-app-accent hover:text-app-accent flex h-8 w-8 items-center justify-center border transition-colors"*/}
      {/*    >*/}
      {/*      <ChevronRight size={16} strokeWidth={1.75} />*/}
      {/*    </button>*/}
      {/*  </div>*/}
      {/*)}*/}

      <ImageLightbox
        photos={slides}
        activeIndex={lightboxIndex}
        onCloseAction={() => setLightboxIndex(null)}
      />
    </div>
  );
}
