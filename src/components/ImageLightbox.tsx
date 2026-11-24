'use client';

import { Photo } from '@/types/projects';
import { ReactNode, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Lightbox, { type Slide } from 'yet-another-react-lightbox';
import Video from 'yet-another-react-lightbox/plugins/video';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import 'yet-another-react-lightbox/styles.css';
import { CloseIcon } from '@/assets/icons';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ActionBox } from '@/app/(site)/[locale]/_components/_ui/ActionBox';
import { imageKitSrcSet, isImageKitUrl } from '@/lib/imagekit/loader';

type ImageCaption = {
  title?: string;
  subtitle?: string;
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
  const slides = useMemo<Slide[]>(
    () =>
      photos.map(({ photo }) =>
        photo.mimeType?.startsWith('video/')
          ? {
              type: 'video',
              width: photo.width,
              height: photo.height,
              sources: [{ src: photo.src, type: photo.mimeType }],
              controls: true,
              playsInline: true,
              autoPlay: false,
              preload: 'metadata',
            }
          : {
              src: photo.src,
              width: photo.width,
              height: photo.height,
              alt: photo.alt,
              // Lets the lightbox (and its thumbnails) pick a resized copy instead of the full original.
              ...(isImageKitUrl(photo.src) && photo.width && photo.height
                ? { srcSet: imageKitSrcSet(photo.src, photo.width, photo.height) }
                : {}),
            }
      ),
    [photos]
  );

  const plugins = showThumbnails ? [Video, Thumbnails] : [Video];
  const currentCaption = photos[currentIndex]?.caption;
  const hasCaption =
    showCaptions && activeIndex !== null && !!(currentCaption?.title || currentCaption?.subtitle);
  const captionRef = useRef<HTMLDivElement>(null);
  const [captionHeight, setCaptionHeight] = useState(0);

  useLayoutEffect(() => {
    const node = captionRef.current;
    if (!hasCaption || !node) return;
    const measure = () => setCaptionHeight(node.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasCaption]);

  return (
    <>
      {children}
      <Lightbox
        open={activeIndex !== null}
        close={onCloseAction}
        index={activeIndex ?? 0}
        slides={slides}
        plugins={plugins}
        carousel={{ finite: true }}
        // The controller subtracts its padding when measuring images/videos.
        // CSS padding on an individual slide does not update that calculation.
        styles={{ container: { paddingTop: Math.max(64, hasCaption ? captionHeight : 0) } }}
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
          buttonPrev: slides.length <= 1 ? () => null : undefined,
          buttonNext: slides.length <= 1 ? () => null : undefined,
          iconPrev: () => (
            <ActionBox colorMode="onDark" className="hidden bg-(--yarl__color_backdrop) md:flex">
              <ArrowLeft width={90} strokeWidth={1.5} />
            </ActionBox>
          ),
          iconNext: () => (
            <ActionBox colorMode="onDark" className="hidden bg-(--yarl__color_backdrop) md:flex">
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
      {/* Keep the caption outside the swipe track and reserve its measured
          height inside the controller. Update text and counter together. */}
      {hasCaption &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={captionRef}
            className="bg-app-accent pointer-events-none fixed top-0 right-18 left-0 z-10000 px-4 py-3"
          >
            <div className="max-w-2xl">
              <p className="text-app-on-dark">
                {currentCaption?.title}
                <span className="text-app-on-dark ml-3 normal-case">
                  {currentIndex + 1}&nbsp;/&nbsp;{photos.length}
                </span>
              </p>
              {currentCaption?.subtitle && (
                <p className="text-app-on-dark mt-0.5">{currentCaption.subtitle}</p>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
