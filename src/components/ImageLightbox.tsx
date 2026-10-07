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
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ActionBox } from '@/app/(site)/[locale]/_components/_ui/ActionBox';

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
                width: 72,
                height: 52,
                gap: 10,
                border: 0,
                borderRadius: 0,
                padding: 0,
                imageFit: 'cover',
                vignette: true,
              }
            : undefined
        }
        render={{
          iconPrev: () => (
            <ActionBox colorMode="onDark">
              <ArrowLeft width={90} strokeWidth={1.5} />
            </ActionBox>
          ),
          iconNext: () => (
            <ActionBox colorMode="onDark">
              <ArrowRight width={90} strokeWidth={1.5} />
            </ActionBox>
          ),
          iconClose: () => (
            <span className="text-app-accent-lightest hover:text-app-on-dark">
              <CloseIcon className="h-9 w-9" />
            </span>
          ),
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
          <div className="pointer-events-none fixed inset-x-0 top-0 z-10000 bg-none px-4 py-3">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="max-w-80"
              >
                <p className="text-app-on-dark">
                  {currentCaption.title}
                  <span className="text-app-on-dark ml-3 normal-case">
                    {currentIndex + 1}&nbsp;/&nbsp;{currentCaption.photosCount ?? photos.length}
                  </span>
                </p>
                {currentCaption.subtitle && (
                  <p className="text-app-on-dark mt-0.5">{currentCaption.subtitle}</p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>,
          document.body
        )}
    </>
  );
};
