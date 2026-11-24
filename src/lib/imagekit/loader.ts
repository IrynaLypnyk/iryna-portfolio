import type { ImageLoaderProps } from 'next/image';

const IMAGEKIT_HOST = 'ik.imagekit.io';
const DEFAULT_QUALITY = 75;

export function isImageKitUrl(src: string): boolean {
  try {
    return new URL(src).hostname === IMAGEKIT_HOST;
  } catch {
    return false;
  }
}

/**
 * Resizes on ImageKit's CDN instead of Vercel's `/_next/image`, which would fetch the original
 * from ImageKit and re-encode it on a cold cache. `f-auto` serves AVIF/WebP when the browser
 * accepts it.
 */
export function imageKitLoader({ src, width, quality }: ImageLoaderProps): string {
  const url = new URL(src);
  url.searchParams.set('tr', `w-${width},q-${quality ?? DEFAULT_QUALITY},f-auto`);
  return url.toString();
}

/** Widths offered to the lightbox, capped at the original's width so nothing is upscaled. */
const LIGHTBOX_WIDTHS = [640, 1080, 1600, 2400];

export function imageKitSrcSet(src: string, originalWidth: number, originalHeight: number) {
  const widths = LIGHTBOX_WIDTHS.filter((width) => width < originalWidth);
  return [...widths, originalWidth].map((width) => ({
    src: imageKitLoader({ src, width, quality: 80 }),
    width,
    height: Math.round((originalHeight * width) / originalWidth),
  }));
}
