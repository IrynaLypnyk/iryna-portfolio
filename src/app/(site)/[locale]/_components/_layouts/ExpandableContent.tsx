'use client';

import { useId, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShowMoreButton } from '@/app/(site)/[locale]/_components/_ui/ShowMoreButton';
import { cn } from '@/lib/utils';

type Props = {
  as?: 'div' | 'article';
  'data-component'?: string;
  visibleContent: ReactNode;
  expandableContent: ReactNode;
  /** Static siblings positioned in the outer grid, such as a cover or links. */
  children?: ReactNode;
  /** Describes the content in the toggle's accessible label. */
  label: string;
  expandable?: boolean;
  defaultOpen?: boolean;
  className?: string;
  contentClassName?: string;
  expandableContentClassName?: string;
  buttonClassName?: string;
};

export function ExpandableContent({
  as: Component = 'div',
  'data-component': dataComponent = 'ExpandableContent',
  visibleContent,
  expandableContent,
  children,
  label,
  expandable = true,
  defaultOpen = false,
  className,
  contentClassName,
  expandableContentClassName,
  buttonClassName,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const detailsId = useId();

  return (
    <Component
      data-component={dataComponent}
      className={cn(
        'group relative grid items-start gap-x-[clamp(20px,3.5vw,48px)]',
        "[grid-template-areas:'content'_'expanded'_'btn'] md:grid-cols-[auto_minmax(0,1fr)] md:[grid-template-areas:'btn_content'_'btn_expanded']",
        className
      )}
    >
      <div className={cn('min-w-0 [grid-area:content]', contentClassName)}>{visibleContent}</div>
      {children}
      {expandable && (
        <div id={detailsId} className="min-w-0 [grid-area:expanded]">
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                key="expanded-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className={expandableContentClassName}>{expandableContent}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      {expandable && (
        <ShowMoreButton
          open={open}
          setOpenAction={() => setOpen((current) => !current)}
          detailsId={detailsId}
          projectTitle={label}
          className={cn('mt-6 [grid-area:btn] md:mt-0', buttonClassName)}
        />
      )}
    </Component>
  );
}
