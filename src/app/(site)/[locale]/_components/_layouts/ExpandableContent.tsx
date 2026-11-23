'use client';

import { useId, useState, type ReactNode } from 'react';
import { Collapse } from '@/app/(site)/[locale]/_components/_ui/Collapse';
import { ShowMoreButton } from '@/app/(site)/[locale]/_components/_ui/ShowMoreButton';
import { cn } from '@/lib/utils';

type Props = {
  as?: 'div' | 'article';
  'data-component'?: string;
  visibleContent: ReactNode;
  expandedContent: ReactNode;
  /** Static siblings positioned in the outer grid, such as a cover or links. */
  children?: ReactNode;
  /** Expanded content that spans the outer grid, such as a project gallery. */
  fullWidthExpandedContent?: ReactNode;
  /** Describes the content in the toggle's accessible label. */
  label: string;
  expandable?: boolean;
  defaultOpen?: boolean;
  className?: string;
  contentClassName?: string;
  expandedContentClassName?: string;
  buttonClassName?: string;
};

export function ExpandableContent({
  as: Component = 'div',
  'data-component': dataComponent = 'ExpandableContent',
  visibleContent,
  expandedContent,
  children,
  fullWidthExpandedContent,
  label,
  expandable = true,
  defaultOpen = false,
  className,
  contentClassName,
  expandedContentClassName,
  buttonClassName,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const detailsId = useId();
  const fullWidthContentId = `${detailsId}-full-width`;

  return (
    <Component
      data-component={dataComponent}
      className={cn(
        'group relative grid items-start gap-x-[clamp(20px,3.5vw,48px)]',
        "[grid-template-areas:'content'_'fullWidthExpanded'_'btn'] md:grid-cols-[auto_minmax(0,1fr)] md:[grid-template-areas:'btn_content'_'fullWidthExpanded_fullWidthExpanded']",
        className
      )}
    >
      <div className={cn('min-w-0 [grid-area:content]', contentClassName)}>
        {visibleContent}
        {expandable && (
          <div id={detailsId}>
            <Collapse open={open} duration={250}>
              <div className={expandedContentClassName}>{expandedContent}</div>
            </Collapse>
          </div>
        )}
      </div>
      {children}
      {expandable && fullWidthExpandedContent && (
        <div id={fullWidthContentId} className="min-w-0 [grid-area:fullWidthExpanded]">
          <Collapse open={open} duration={300}>
            {fullWidthExpandedContent}
          </Collapse>
        </div>
      )}
      {expandable && (
        <ShowMoreButton
          open={open}
          setOpenAction={() => setOpen((current) => !current)}
          detailsId={detailsId}
          fullWidthContentId={fullWidthExpandedContent ? fullWidthContentId : undefined}
          projectTitle={label}
          className={cn('mt-6 [grid-area:btn] md:mt-0', buttonClassName)}
        />
      )}
    </Component>
  );
}
