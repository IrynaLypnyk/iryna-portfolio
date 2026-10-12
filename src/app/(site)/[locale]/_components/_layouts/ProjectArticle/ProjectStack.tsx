import { cn } from '@/lib/utils';

type Props = {
  items: readonly string[];
  separator?: 'dot' | 'comma';
  size?: 'sm' | 'lg';
  color?: 'blue' | 'gray';
};

/** Shared presentation for project technologies, including the admin preview. */
export function ProjectStack({ items, separator = 'dot', size = 'lg', color = 'gray' }: Props) {
  if (items.length === 0) return null;

  return (
    <span
      data-component="ProjectStack"
      className={cn(
        'inline-flex flex-wrap items-center gap-x-2 gap-y-1 font-mono',
        size === 'sm' ? 'text-xs' : 'text-sm',
        color === 'blue' ? 'text-app-accent' : 'text-app-muted'
      )}
    >
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className={cn('inline-flex items-center', separator === 'dot' && 'gap-2')}
        >
          <span>{item}</span>
          {index < items.length - 1 &&
            (separator === 'dot' ? (
              <span aria-hidden="true" className="h-0.5 w-0.5 shrink-0 rounded-full bg-current" />
            ) : (
              <span aria-hidden="true">,</span>
            ))}
        </span>
      ))}
    </span>
  );
}
