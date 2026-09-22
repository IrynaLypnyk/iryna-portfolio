import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { NavigationLabelKey } from '@/constants/navigation';

type Props = {
  id?: NavigationLabelKey;
  children: ReactNode;
  className?: string;
};

export function Section({ id, children, className }: Props) {
  return (
    <section data-component="Section" className={cn('py-(--section-py)', className)}>
      <div id={id} className="scroll-mt-(--header-height)">
        {children}
      </div>
    </section>
  );
}
