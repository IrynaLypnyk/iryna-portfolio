import { cn } from '@/lib/utils';

type Props = {
  index: string;
  title: string;
  className?: string;
};
export function SectionHeader({ index, title, className }: Props) {
  return (
    <div
      data-component="SectionHeader"
      className={cn(
        'border-app-line mb-[clamp(40px,7vh,84px)] flex items-baseline gap-4.5 border-t pt-5.5',
        className
      )}
    >
      <span className="text-app-accent-bright font-mono text-xs">{index}</span>
      <h2 className="text-[clamp(28px,4.4vw,60px)] leading-none font-medium tracking-[-0.03em]">
        {title}
      </h2>
    </div>
  );
}
