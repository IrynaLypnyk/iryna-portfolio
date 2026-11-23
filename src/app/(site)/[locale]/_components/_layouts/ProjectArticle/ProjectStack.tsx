import { cn } from '@/lib/utils';

type Props = {
  items: readonly string[];
  size?: 'sm' | 'lg';
  color?: 'blue' | 'gray';
};

/** Shared technology tags for projects, experiments and the admin preview. */
export function ProjectStack({ items, size = 'lg', color = 'gray' }: Props) {
  if (items.length === 0) return null;

  return (
    <span
      data-component="ProjectStack"
      className={cn(
        'inline-flex max-w-full flex-wrap items-center gap-2 align-middle font-mono tracking-normal',
        size === 'sm' ? 'text-xs' : 'text-sm',
        color === 'blue' ? 'text-app-accent' : 'text-app-muted'
      )}
    >
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className={cn(
            'border-app-line max-w-full rounded-sm border leading-normal [overflow-wrap:anywhere]',
            size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1'
          )}
        >
          {item}
        </span>
      ))}
    </span>
  );
}
