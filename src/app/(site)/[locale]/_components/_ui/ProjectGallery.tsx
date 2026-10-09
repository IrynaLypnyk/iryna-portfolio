'use client';

import { useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ImageLightbox, type GalleryImage } from '@/components/ImageLightbox';
import type { Photo } from '@/types/projects';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { TextLink } from '@/app/(site)/[locale]/_components/_ui/TextLink';
import { cn } from '@/lib/utils';

type Props = {
  photos: Photo<string>[];
  imageHeightClass?: string;
};

// const navButtonClassnames =
//   'border-app-line text-app-muted hover:border-app-accent hover:text-app-accent flex h-8 w-8 items-center justify-center border transition-colors cursor-pointer';
const IMAGE_HEIGHT_CLASS = 'h-85';
/**
 * Horizontal swipeable strip of screenshots shown inside an expanded project
 * card. Clicking a thumbnail opens it in the shared `ImageLightbox`; the
 * caption/link for a photo sits underneath it rather than on hover, since
 * hover has no equivalent on touch devices.
 */
export function ProjectGallery({ photos, imageHeightClass = IMAGE_HEIGHT_CLASS }: Props) {
  const t = useTranslations('Work');
  const trackRef = useRef<HTMLDivElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // function scrollGallery(direction: -1 | 1) {
  //   const track = trackRef.current;
  //   if (!track) return;
  //
  //   track.scrollBy({
  //     left: direction * track.clientWidth,
  //     behavior: 'smooth',
  //   });
  // }

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
      {/*{photos.length > 1 && (*/}
      {/*  <div className="flex gap-2">*/}
      {/*    <button*/}
      {/*      type="button"*/}
      {/*      aria-label={t('galleryPrev')}*/}
      {/*      onClick={() => scrollGallery(-1)}*/}
      {/*      className={navButtonClassnames}*/}
      {/*    >*/}
      {/*      <ChevronLeft size={16} strokeWidth={1.75} />*/}
      {/*    </button>*/}
      {/*    <button*/}
      {/*      type="button"*/}
      {/*      aria-label={t('galleryNext')}*/}
      {/*      onClick={() => scrollGallery(1)}*/}
      {/*      className={navButtonClassnames}*/}
      {/*    >*/}
      {/*      <ChevronRight size={16} strokeWidth={1.75} />*/}
      {/*    </button>*/}
      {/*  </div>*/}
      {/*)}*/}

      <div
        ref={trackRef}
        className="scrollbar-hide flex snap-x snap-mandatory items-start gap-3 overflow-x-auto pb-1"
      >
        {photos.map((photo, index) => (
          <div key={photo.id} className="flex min-w-0 shrink-0 snap-start flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setLightboxIndex(index)}
              aria-label={t(photo.mimeType?.startsWith('video/') ? 'openVideo' : 'openPhoto', {
                index: index + 1,
                count: photos.length,
              })}
              className="relative cursor-zoom-in"
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
                    className={cn('pointer-events-none w-auto', imageHeightClass)}
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
                  className={cn('w-auto', imageHeightClass)}
                />
              )}
            </button>

            {(photo.description || photo.linkUrl) && (
              <div className="flex max-w-full flex-col gap-1 text-sm tracking-wide">
                {photo.description && <span className="text-app-muted">{photo.description}</span>}
                {photo.linkUrl && (
                  <TextLink href={photo.linkUrl} isExternal>
                    {t('demoLabel')}
                  </TextLink>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <ImageLightbox
        photos={slides}
        activeIndex={lightboxIndex}
        onCloseAction={() => setLightboxIndex(null)}
      />
    </div>
  );
}
