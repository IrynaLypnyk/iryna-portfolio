'use client';

import Image, { type ImageProps } from 'next/image';
import { imageKitLoader, isImageKitUrl } from '@/lib/imagekit/loader';

/**
 * `next/image` that loads ImageKit photos straight from ImageKit's CDN. Other sources (local
 * files, Storybook fixtures) keep Next's default optimizer. Lives in a client module because a
 * loader function can't be passed from a Server Component.
 */
export function ImageKitImage({ src, alt, ...props }: ImageProps) {
  const loader = typeof src === 'string' && isImageKitUrl(src) ? imageKitLoader : undefined;
  return <Image src={src} alt={alt} loader={loader} {...props} />;
}
