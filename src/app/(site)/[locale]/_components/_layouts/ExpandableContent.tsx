'use client';

import { useId, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShowMoreButton } from '@/app/(site)/[locale]/_components/_ui/ShowMoreButton';
import { cn } from '@/lib/utils';

type Props = {
  visibleContent: ReactNode;
  expandableContent: ReactNode;
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
  visibleContent,
  expandableContent,
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
    <div
      data-component="ExpandableContent"
      className={cn(
        'group border-app-line relative grid items-start gap-x-[clamp(20px,3.5vw,48px)] border-t py-4 last:border-b md:py-6',
        "[grid-template-areas:'content'_'btn'] md:grid-cols-[auto_minmax(0,1fr)] md:[grid-template-areas:'btn_content']",
        className
      )}
    >
      <div className={cn('min-w-0 [grid-area:content]', contentClassName)}>
        {visibleContent}
        {expandable && (
          <div id={detailsId}>
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
      </div>
      {expandable && (
        <ShowMoreButton
          open={open}
          setOpenAction={() => setOpen((current) => !current)}
          detailsId={detailsId}
          projectTitle={label}
          className={cn('mt-6 [grid-area:btn] md:mt-0', buttonClassName)}
        />
      )}
    </div>
  );
}
