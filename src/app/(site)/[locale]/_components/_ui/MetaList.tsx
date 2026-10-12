import { cn } from '@/lib/utils';
import { Label } from '@/app/(site)/[locale]/_components/_ui/Label';
import type { CSSProperties, ReactNode } from 'react';

export type MetaItem = {
  label: string;
  value: ReactNode;
};

type Props = {
  items: MetaItem[];
  /** Width of the `<dt>` column for the row variants. 68px in project blocks, 116px in About. */
  labelWidth?: number | string;
  columnGap?: number | string;
  /**
   * `compact` — mono rows inside a project block.
   * `roomy`   — body-size rows in About.
   * `panel`   — stacked label-over-value column with a left rule (hero, case study).
   * `responsive-panel` — compact rows on mobile, panel from md upward, using CSS only.
   */
  variant?: 'compact' | 'roomy' | 'panel' | 'responsive-panel';
  className?: string;
  labelClassName?: string;
  labelColor?: 'blue' | 'gray';
  textColor?: 'gray' | 'black';
};

export function MetaList({
  items,
  labelWidth = 'min-content',
  columnGap,
  variant = 'compact',
  labelColor = 'gray',
  textColor = 'gray',
  className,
  labelClassName,
}: Props) {
  const isResponsivePanel = variant === 'responsive-panel';

  if (variant === 'panel' || isResponsivePanel) {
    return (
      <dl
        data-component="MetaList"
        style={
          isResponsivePanel
            ? ({
                '--meta-label-width':
                  typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth,
              } as CSSProperties)
            : undefined
        }
        className={cn(
          'm-0 grid gap-3 gap-x-[clamp(20px,3vw,40px)] md:gap-6.5',
          'border-app-line',
          'md:grid-cols-1 md:border-t-0 md:border-l md:pt-0 md:pl-[clamp(20px,2.6vw,36px)]',
          isResponsivePanel && 'max-md:gap-1',
          className
        )}
      >
        {items.map((item) => (
          <div
            key={item.label}
            className={cn(
              'grid gap-1.5',
              isResponsivePanel &&
                'max-md:grid-cols-[var(--meta-label-width)_minmax(0,1fr)] max-md:gap-1'
            )}
          >
            <dt>
              <Label
                color={labelColor}
                size="xs"
                className={cn(isResponsivePanel && 'max-md:tracking-wide', labelClassName)}
              >
                {item.label}
              </Label>
            </dt>
            <dd
              className={cn(
                'm-0 text-base',
                textColor === 'gray' ? 'text-app-muted' : 'text-app-text',
                isResponsivePanel && 'max-md:text-app-muted max-md:ml-2 max-md:tracking-wide'
              )}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  const isRoomy = variant === 'roomy';

  return (
    <dl data-component="MetaList" className={cn('m-0 grid gap-1', className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className={`grid gap-${columnGap ? `[${columnGap}]` : 1}`}
          style={{
            gridTemplateColumns:
              labelWidth !== undefined
                ? `${typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth} minmax(0, 1fr)`
                : undefined,
          }}
        >
          <dt>
            <Label
              color={labelColor}
              variant={isRoomy ? 'roomy' : 'compact'}
              size={isRoomy ? 'sm' : 'xs'}
            >
              {item.label}
            </Label>
          </dt>
          <dd className={cn('text-app-muted m-0 ml-2 text-base tracking-wide')}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
