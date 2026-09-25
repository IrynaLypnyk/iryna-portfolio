'use client';

import { Photo } from '@/types/projects';
import { ReactNode, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Lightbox from 'yet-another-react-lightbox';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import 'yet-another-react-lightbox/styles.css';
import { CloseIcon } from '@/assets/icons';
import { ArrowHorizontalLong } from '@/components/ArrowHorizontalLong';

type ImageCaption = {
  title?: string;
  subtitle?: string;
  photosCount?: number;
};

export type GalleryImage = {
  photo: Photo<string>;
  caption?: ImageCaption;
};

type Props = {
  children?: ReactNode; // Photo Gallery component or trigger content
  photos: GalleryImage[];
  activeIndex: number | null;
  onCloseAction: () => void;
  showCaptions?: boolean;
  showThumbnails?: boolean;
};

export const ImageLightbox = ({
  children,
  photos,
  activeIndex,
  onCloseAction,
  showCaptions = true,
  showThumbnails = true,
}: Props) => {
  // Tracks the slide actually on screen, independent of `activeIndex` (which
  // only sets the *opening* slide) — the library reports swipes/arrow-nav
  // through `on.view`, letting the caption below follow along. Resetting on
  // every new `activeIndex` is done during render (React's documented pattern
  // for "adjusting state when a prop changes") rather than in an effect.
  const [prevActiveIndex, setPrevActiveIndex] = useState(activeIndex);
  const [currentIndex, setCurrentIndex] = useState(activeIndex ?? 0);

  if (activeIndex !== prevActiveIndex) {
    setPrevActiveIndex(activeIndex);

    if (activeIndex !== null) {
      setCurrentIndex(activeIndex);
    }
  }

  // Memoized for the same reason as `ProjectGallery`'s `slides`: the library
  // resets its internal current slide back to `index` whenever this array's
  // reference changes, so recomputing it on every render (including the ones
  // `on.view` itself triggers below) would silently cancel navigation.
  const slides = useMemo(
    () =>
      photos.map(({ photo }, idx) => ({
        src: photo.src,
        width: photo.width,
        height: photo.height,
        alt: photo.alt,
        index: idx,
      })),
    [photos]
  );

  const plugins = showThumbnails ? [Thumbnails] : [];
  const currentCaption = photos[currentIndex]?.caption;

  return (
    <>
      {children}
      <Lightbox
        open={activeIndex !== null}
        close={onCloseAction}
        index={activeIndex ?? 0}
        slides={slides}
        plugins={plugins}
        on={{ view: ({ index }) => setCurrentIndex(index) }}
        thumbnails={
          showThumbnails
            ? {
                position: 'bottom',
                width: 52,
                height: 52,
                gap: 10,
                border: 0,
                borderRadius: 8,
                padding: 0,
                imageFit: 'cover',
                vignette: true,
              }
            : undefined
        }
        render={{
          iconPrev: () => (
            <ArrowHorizontalLong
              direction="left"
              width={90}
              strokeWidth={2}
              className="text-accent-pale hover:text-paper hidden md:inline-block"
            />
          ),
          iconNext: () => (
            <ArrowHorizontalLong
              direction="right"
              width={90}
              strokeWidth={2}
              className="text-accent-pale hover:text-paper hidden md:inline-block"
            />
          ),
          iconClose: () => <CloseIcon className="h-9 w-9" />,
        }}
      />
      {/*
       * Rendered as our own portal rather than through the library's
       * `render.controls` slot: that slot reads from the library's own props
       * context, which doesn't reliably re-render on every `on.view` tick, so
       * the caption could appear frozen. Owning the DOM node ourselves means
       * it always reflects `currentIndex` directly — fading out, then back in
       * on every slide change, without ever traveling with the swipe.
       */}
      {showCaptions &&
        activeIndex !== null &&
        currentCaption &&
        (currentCaption.title || currentCaption.subtitle) &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 top-0 z-[10000] bg-black/50 px-4 py-3">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <p className="text-[14px] leading-none font-bold tracking-tight text-white uppercase sm:text-[16px]">
                  {currentCaption.title}
                  <span className="text-accent-pale ml-3 text-[12px] font-bold tracking-widest normal-case">
                    {currentIndex + 1} / {currentCaption.photosCount ?? photos.length}
                  </span>
                </p>
                {currentCaption.subtitle && (
                  <p className="text-accent-pale mt-0.5 text-[14px] font-semibold tracking-wide">
                    {currentCaption.subtitle}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>,
          document.body
        )}
    </>
  );
};
