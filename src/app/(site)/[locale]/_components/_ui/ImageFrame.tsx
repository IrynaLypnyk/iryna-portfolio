import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { Photo } from '@/types/projects';

type Props = {
  photo: Photo<string> | null;
  /** Shown inside the empty frame while a project has no cover yet. */
  placeholder?: string | null;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

/**
 * The 16:10 screenshot frame used by every project block. Renders the cover
 * when there is one, and otherwise holds the same space as a labelled shell —
 * a project is publishable before its screenshot has been uploaded.
 */
export function ImageFrame({
  photo,
  placeholder,
  priority = false,
  sizes = '(min-width: 1024px) 60vw, 100vw',
  className,
}: Props) {
  return (
    <div
      data-component="ImageFrame"
      className={cn(
        'border-app-line bg-shell relative aspect-16/10 overflow-hidden border',
        className,
        !photo && 'project-placeholder'
      )}
    >
      {photo ? (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        placeholder !== null && (
          <span className="text-app-muted absolute inset-0 flex items-center justify-center p-6 text-center font-mono text-xs tracking-wide uppercase">
            {placeholder || 'Cover coming soon'}
          </span>
        )
      )}
    </div>
  );
}
