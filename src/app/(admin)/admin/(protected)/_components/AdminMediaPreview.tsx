import Image from 'next/image';

import { cn } from '@/lib/utils';

type AdminMediaPreviewFit = 'cover' | 'contain';

type AdminMediaPreviewProps = {
  src: string;
  mimeType?: string | null;
  alt?: string;
  sizes?: string;
  fit?: AdminMediaPreviewFit;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

export function AdminMediaPreview({
  src,
  mimeType,
  alt = '',
  sizes = '96px',
  fit = 'cover',
  className,
  imageClassName,
  priority,
}: AdminMediaPreviewProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100',
        className
      )}
    >
      {mimeType?.startsWith('video/') ? (
        <>
          <video
            src={src}
            muted
            playsInline
            preload="metadata"
            aria-label={alt || 'Video preview'}
            className={cn(
              'h-full w-full',
              fit === 'cover' ? 'object-cover' : 'object-contain',
              imageClassName
            )}
          />
          <span className="absolute right-1 bottom-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
            Video
          </span>
        </>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn(fit === 'cover' ? 'object-cover' : 'object-contain', imageClassName)}
        />
      )}
    </div>
  );
}
