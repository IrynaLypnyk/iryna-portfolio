import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const linkStyles =
  'hover:text-app-accent-bright active:text-app-ink transition-colors inline-flex items-center transition-colors text-app-accent';

type Props = {
  href: string;
  isExternal?: boolean;
  children: ReactNode;
  className?: string;
};

const arrow = <ArrowUpRight strokeWidth={1.5} className="w-4" />;

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
      {children}
      {arrow}
    </Link>
  );
}
