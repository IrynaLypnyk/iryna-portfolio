'use client';

import { Photo } from '@/types/projects';
import { ReactNode } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import 'yet-another-react-lightbox/plugins/captions.css';
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
  const slides = photos.map(({ photo, caption }, idx) => ({
    src: photo.src,
    width: photo.width,
    height: photo.height,
    alt: photo.alt,
    index: idx,
    title: showCaptions ? (
      <div>
        <p className="text-[14px] leading-none font-bold tracking-tight text-white uppercase sm:text-[16px]">
          {caption?.title}
          <span className="text-accent-pale ml-3 text-[12px] font-bold tracking-widest normal-case">
            {idx + 1} / {photos.length}
          </span>
        </p>
        <p className="text-accent-pale mt-0.5 text-[14px] font-semibold tracking-wide">
          {caption?.subtitle}
        </p>
      </div>
    ) : undefined,
  }));

  const plugins = [...(showThumbnails ? [Thumbnails] : []), ...(showCaptions ? [Captions] : [])];

  return (
    <>
      {children}
      <Lightbox
        open={activeIndex !== null}
        close={onCloseAction}
        index={activeIndex ?? 0}
        slides={slides}
        plugins={plugins}
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
    </>
  );
};
