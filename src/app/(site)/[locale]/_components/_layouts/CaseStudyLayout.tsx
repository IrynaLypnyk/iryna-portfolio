import type { ReactNode } from 'react';
import type { CaseBlock, Photo } from '@/types/projects';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import { ImageFrame } from '@/app/(site)/[locale]/_components/_ui/ImageFrame';
import { MetaList, type MetaItem } from '@/app/(site)/[locale]/_components/_ui/MetaList';
import { AppLink } from '@/app/(site)/[locale]/_components/_ui/AppLink';
import { CaseSection } from '../_sections/CaseSection';
import { ImagesGallery } from '@/app/(site)/[locale]/_components/_ui/ImagesGallery';
import { Label } from '@/app/(site)/[locale]/_components/_ui/Label';

type Props = {
  componentName: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  cover: Photo<string> | null;
  meta: MetaItem[];
  sections: CaseBlock[];
  photos: Photo<string>[];
  galleryLabel: string;
  backHref: string;
  backLabel: string;
  next: { href: string; title: string } | null;
  nextLabel: string;
  children?: ReactNode;
};

export function CaseStudyLayout({
  componentName,
  title,
  subtitle,
  description,
  cover,
  meta,
  sections,
  backHref,
  backLabel,
  next,
  nextLabel,
  children,
  photos,
  galleryLabel,
}: Props) {
  return (
    <article data-component={componentName}>
      <section className="pb-[clamp(32px,6vh,64px)]">
        <AppLink
          href={backHref}
          internal
          arrow="left"
          arrowPosition="before"
          color="blueBright"
          fontMono
          className="pt-[clamp(32px,6vh,64px)]"
        >
          {backLabel}
        </AppLink>
        <div
          className={cn(
            'grid w-full min-w-0 grid-cols-1 items-start gap-[clamp(32px,6vw,88px)] pt-[clamp(20px,4vh,44px)]',
            cover
              ? "[grid-template-areas:'image'_'title'] md:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] md:[grid-template-areas:'title_image']"
              : "[grid-template-areas:'title']"
          )}
        >
          <div className="flex min-w-0 flex-col gap-6 [grid-area:title]">
            <h1 className="text-[clamp(32px,4vw,56px)] leading-[1.08] font-semibold tracking-[-0.038em] wrap-break-word">
              {title}
            </h1>
            {subtitle && (
              <p className="text-accent text-[clamp(20px,2.4vw,30px)] leading-[1.24] font-medium tracking-[-0.024em]">
                {subtitle}
              </p>
            )}
            {description && (
              <p className="text-app-text max-w-165 text-base leading-normal tracking-wide text-pretty">
                {description}
              </p>
            )}
            {meta.length > 0 && (
              <MetaList
                variant="compact"
                labelColor="black"
                textColor="black"
                items={meta}
                labelWidth={120}
              />
            )}
          </div>
          <ImageFrame photo={cover} priority className="aspect-4/3 w-full [grid-area:image]" />
        </div>
      </section>

      {children}

      {sections.length > 0 && (
        <section className="grid gap-[clamp(40px,7vh,80px)]">
          {sections.map((block) => (
            <CaseSection key={block.id} section={block} />
          ))}
        </section>
      )}

      {photos.length > 0 && (
        <section className="grid min-w-0 gap-6 pt-[clamp(56px,10vh,120px)]">
          <Label color="blue">{galleryLabel}</Label>
          <ImagesGallery photos={photos} />
        </section>
      )}

      <section className="pt-[clamp(56px,10vh,120px)] pb-[clamp(72px,12vh,140px)]">
        <div className="border-app-line flex flex-wrap items-center justify-between gap-6 border-t pt-6.5">
          <AppLink href={backHref} internal arrow="left" arrowPosition="before" color="gray">
            {backLabel}
          </AppLink>
          {next && (
            <Link
              href={next.href}
              className="text-app-text hover:text-accent min-h-11 text-right text-[clamp(18px,2vw,26px)] tracking-[-0.02em] transition-colors"
            >
              {nextLabel}: {next.title} →
            </Link>
          )}
        </div>
      </section>
    </article>
  );
}
