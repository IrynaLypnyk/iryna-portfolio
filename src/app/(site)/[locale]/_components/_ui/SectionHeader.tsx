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
      className={cn('mb-[clamp(40px,7vh,84px)] flex items-baseline gap-4.5 pt-5.5', className)}
    >
      {index && <span className="text-app-accent-bright font-mono text-xs">{index}</span>}
      <div className="flex flex-col gap-2">
        <TitleTag className="text-[clamp(28px,4.4vw,60px)] leading-none font-medium tracking-tight">
          {title}
        </TitleTag>
        {subtitle && (
          <SubtitleTag className="text-app-accent-bright font-mono text-base leading-none">
            {subtitle}
          </SubtitleTag>
        )}
      </div>
    </div>
  );
}
