import { cn } from '@/lib/utils';

type Props = {
  index?: string;
  title: string;
  subtitle?: string;
  className?: string;
  titleTag?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  subtitleTag?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
};
export function SectionHeader({
  index,
  title,
  subtitle,
  className,
  titleTag = 'h2',
  subtitleTag = 'h3',
}: Props) {
  const TitleTag = titleTag;
  const SubtitleTag = subtitleTag;

  return (
    <div
      data-component="SectionHeader"
      className={cn('mb-7.5 flex items-baseline gap-4.5 pt-5.5 md:mb-10 lg:mb-20', className)}
    >
      {index && <span className="text-app-accent-bright-text font-mono text-xs">{index}</span>}
      <div className="flex flex-col gap-2">
        <TitleTag className="text-[clamp(1.75rem,calc(0.6389rem+3.5556vw),3.75rem)] leading-none font-medium tracking-tight">
          {title}
        </TitleTag>
        {subtitle && (
          <SubtitleTag className="text-app-accent-bright-text font-mono text-base leading-normal tracking-wide">
            {subtitle}
          </SubtitleTag>
        )}
      </div>
    </div>
  );
}
