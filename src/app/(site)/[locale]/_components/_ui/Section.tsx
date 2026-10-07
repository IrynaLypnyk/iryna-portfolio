import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  /** Anchor id for the section. Not every section is a header-nav target. */
  id?: string;
  children: ReactNode;
  className?: string;
};

export function Section({ id, children, className }: Props) {
  return (
    <section
      data-component="Section"
      className={cn('border-app-line border-t py-(--section-py)', className)}
    >
      <div id={id} className="scroll-mt-(--header-height)">
        {children}
      </div>
    </section>
  );
}
