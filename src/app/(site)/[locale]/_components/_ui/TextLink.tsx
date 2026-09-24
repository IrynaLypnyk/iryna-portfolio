import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const linkStyles =
  'hover:text-app-accent-bright active:text-app-accent-dark transition-colors inline-flex items-center transition-colors';

type Props = {
  href: string;
  isExternal?: boolean;
  children: ReactNode;
  className?: string;
};

const arrow = <span className="flex-0">↗</span>;

export function TextLink({ href, isExternal, className, children }: Props) {
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(linkStyles, className)}
      >
        {children}&nbsp;{arrow}
      </a>
    );
  }
  return (
    <Link href={href} className={cn(linkStyles, className)}>
      {children}&nbsp;{arrow}
    </Link>
  );
}
