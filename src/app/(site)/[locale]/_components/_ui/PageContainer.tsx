import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  as?: ElementType;
  id?: string;
  className?: string;
  children: ReactNode;
};

export function PageContainer({ as: Tag = 'div', id, className, children }: Props) {
  return (
    <Tag
      id={id}
      data-component="PageContainer"
      className={cn(
        'mx-auto w-full max-w-(--page-max) pr-(--page-pad-right) pl-(--page-pad-left)',
        className
      )}
    >
      {children}
    </Tag>
  );
}
