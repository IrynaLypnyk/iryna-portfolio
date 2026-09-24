import Image from 'next/image';

import { cn } from '@/lib/utils';

type AdminMediaPreviewFit = 'cover' | 'contain';

type AdminMediaPreviewProps = {
  src: string;
  alt?: string;
  sizes?: string;
  fit?: AdminMediaPreviewFit;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

export function AdminMediaPreview({
  src,
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
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(fit === 'cover' ? 'object-cover' : 'object-contain', imageClassName)}
      />
    </div>
  );
}
