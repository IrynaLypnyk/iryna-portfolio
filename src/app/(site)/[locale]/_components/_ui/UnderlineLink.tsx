import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

type Props = {
  href: string;
  /** Trailing glyph. `none` for plain links. */
  arrow?: 'right' | 'down' | 'external' | 'none';
  /** `plain` is the accent-coloured case-study CTA, with no rule under it. */
  variant?: 'underline' | 'plain';
  /** Route through next-intl's `Link` so the href picks up the locale prefix. */
  internal?: boolean;
  external?: boolean;
  className?: string;
  children: ReactNode;
};

const ARROWS = {
  right: '→',
  down: '↓',
  external: '↗',
  none: null,
} as const;

/**
 * The design's one link treatment: ink text on a pale accent rule that turns
 * fully accent on hover. Used by the hero CTA, the case-study CTAs and the
 * contact links.
 */
export function UnderlineLink({
  href,
  arrow = 'none',
  variant = 'underline',
  internal = false,
  external = false,
  className,
  children,
}: Props) {
  const glyph = ARROWS[arrow];

  const classNames = cn(
    'inline-flex w-fit items-center gap-2 text-[15px] transition-colors',
    variant === 'underline'
      ? 'border-b border-app-accent/20 pb-1.5 text-ink hover:text-app-accent'
      : 'text-app-text hover:text-app-accent-dark',
    className
  );

  const content = (
    <>
      {children}
      {glyph && <span aria-hidden="true">{glyph}</span>}
    </>
  );

  if (internal) {
    return (
      <Link href={href} data-component="UnderlineLink" className={classNames}>
        {content}
      </Link>
    );
  }

  return (
    <a
      href={href}
      data-component="UnderlineLink"
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={classNames}
    >
      {content}
    </a>
  );
}
