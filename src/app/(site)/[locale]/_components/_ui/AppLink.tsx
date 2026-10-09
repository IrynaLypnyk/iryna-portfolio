import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { MoveDown, MoveLeft, ArrowUpRight, ArrowRight } from 'lucide-react';

export type AppLinkProps = {
  href: string;
  /** Trailing glyph. `none` for plain links. */
  arrow?: 'right' | 'left' | 'down' | 'upRight' | 'none';
  arrowPosition?: 'before' | 'after';
  /** `plain` is the accent-coloured case-study CTA, with no rule under it. */
  variant?: 'underline' | 'plain';
  /** Route through next-intl's `Link` so the href picks up the locale prefix. */
  internal?: boolean;
  external?: boolean;
  fontMono?: boolean;
  color?: 'blue' | 'blueBright' | 'gray' | 'black';
  className?: string;
  children: ReactNode;
};

const ARROWS = {
  right: <ArrowRight strokeWidth={1.5} className="h-4 w-4" />,
  left: <MoveLeft strokeWidth={1.5} className="h-4 w-4" />,
  down: <MoveDown strokeWidth={1.5} className="h-4 w-4" />,
  upRight: <ArrowUpRight strokeWidth={1.5} className="h-4 w-4" />,
  none: null,
} as const;

const COLOR_CLASSNAME = {
  blue: 'text-app-accent hover:text-app-text',
  blueBright: 'text-app-accent-bright hover:text-app-text',
  gray: 'text-app-muted hover:text-app-accent-bright',
  black: 'text-app-text hover:text-app-accent-bright',
};

export function AppLink({
  href,
  arrow = 'none',
  arrowPosition = 'after',
  variant = 'plain',
  internal = false,
  external = false,
  fontMono = false,
  color = 'gray',
  className,
  children,
}: AppLinkProps) {
  const classNames = cn(
    'inline-flex w-fit items-center gap-1 transition-colors',
    variant === 'underline' &&
      'border-b border-app-accent-bright/20 pb-1.5 hover:border-app-accent-bright/80',
    fontMono ? 'font-mono uppercase text-sm tracking-widest' : 'font-sans text-base',
    COLOR_CLASSNAME[color],
    className
  );
  const arrowIcon = ARROWS[arrow];
  const renderArrowIcon = arrowIcon ? <span aria-hidden="true">{arrowIcon}</span> : null;

  const isAnchor = href.startsWith('#');

  const content = (
    <>
      {arrowPosition === 'before' && renderArrowIcon}
      {children}
      {arrowPosition === 'after' && renderArrowIcon}
    </>
  );

  if (internal && !isAnchor) {
    return (
      <Link href={href} data-component="AppLink" className={classNames}>
        {content}
      </Link>
    );
  }

  return (
    <a
      href={href}
      data-component="AppLink"
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={classNames}
    >
      {content}
    </a>
  );
}
