import type { CaseBlock } from '@/types/projects';
import { ImagesGallery } from '@/app/(site)/[locale]/_components/_ui/ImagesGallery';
import { CaseBody } from '../_ui/CaseBody';
type Props = { section: CaseBlock };

/**
 * One numbered block of a case study: the counter and heading sit in a narrow
 * left column, the prose in a wider right one, separated by a top hairline.
 */
export function CaseSection({ section }: Props) {
  return (
    <div
      data-component="CaseSection"
      className="border-app-line grid items-start gap-[clamp(24px,5vw,64px)] border-t pt-5.5 md:grid-cols-[minmax(0,0.3fr)_minmax(0,0.7fr)]"
    >
      <div className="flex items-baseline gap-3">
        <span className="text-accent-soft font-mono text-xs">{section.index}</span>
        {section.title && (
          <h2 className="text-[clamp(20px,2vw,26px)] leading-[1.2] font-medium tracking-[-0.022em]">
            {section.title}
          </h2>
        )}
      </div>

      {section.body && <CaseBody body={section.body} />}
      {section.photos.length > 0 && (
        <div className="min-w-0 md:col-span-2">
          <ImagesGallery photos={section.photos} />
        </div>
      )}
    </div>
  );
}
