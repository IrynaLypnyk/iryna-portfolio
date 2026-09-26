import { cn } from '@/lib/utils';
import { Label } from '@/app/(site)/[locale]/_components/_ui/Label';
import { ReactNode } from 'react';

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
   */
  variant?: 'compact' | 'roomy' | 'panel';
  className?: string;
  labelColor?: 'blue' | 'gray';
};

export function MetaList({
  items,
  labelWidth = 68,
  columnGap,
  variant = 'compact',
  labelColor = 'gray',
  className,
}: Props) {
  if (variant === 'panel') {
    return (
      <dl
        data-component="MetaList"
        className={cn(
          'm-0 grid gap-6.5 gap-x-[clamp(20px,3vw,40px)]',
          'border-app-line border-t pt-6.5',
          'md:grid-cols-1 md:border-t-0 md:border-l md:pt-0 md:pl-[clamp(20px,2.6vw,36px)]',
          'max-md:grid-cols-2 max-sm:grid-cols-1',
          className
        )}
      >
        {items.map((item) => (
          <div key={item.label} className="grid gap-1.5">
            <dt>
              <Label color={labelColor}>{item.label}</Label>
            </dt>
            <dd className="text-app-muted m-0 text-base">{item.value}</dd>
          </div>
        ))}
      </dl>
    );
  }

  const isRoomy = variant === 'roomy';

  return (
    <dl
      data-component="MetaList"
      className={cn(
        'text-app-muted m-0 grid',
        isRoomy ? 'gap-3.5 text-[15px]' : 'gap-2.5 font-mono text-xs',
        className
      )}
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={`grid gap-[${columnGap}]`}
          style={{
            gridTemplateColumns:
              labelWidth !== undefined
                ? `${typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth} minmax(0, 1fr)`
                : undefined,
          }}
        >
          <dt
            className={cn(
              'text-app-muted',
              isRoomy ? 'pt-0.5 font-mono text-[2px] tracking-wide uppercase' : 'tracking-label'
            )}
          >
            <Label color={labelColor}>{item.label}</Label>
          </dt>
          <dd className={cn('m-0')}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
