import { ProjectFeatures } from '@/app/(site)/[locale]/_components/_layouts/ProjectArticle/ProjectFeatures';
import { useTranslations } from 'next-intl';
import type { ProjectDetail } from '@/types/projects';
import { ProjectStack } from '@/app/(site)/[locale]/_components/_layouts/ProjectArticle/ProjectStack';
import { Link } from '@/i18n/navigation';
import { ImageFrame } from '@/app/(site)/[locale]/_components/_ui/ImageFrame';
import { ImagesGallery } from '@/app/(site)/[locale]/_components/_ui/ImagesGallery';
import { MetaList, type MetaItem } from '@/app/(site)/[locale]/_components/_ui/MetaList';
import { AppLink } from '@/app/(site)/[locale]/_components/_ui/AppLink';
import { Label } from '@/app/(site)/[locale]/_components/_ui/Label';
import { CaseSection } from './CaseSection';
import { anchors, routes } from '@/constants/routes';
export function ProjectCaseStudy({ detail }: { detail: ProjectDetail }) {
  const t = useTranslations('Work');
  const tMetadata = useTranslations('ProjectMetadata');
  const tProject = useTranslations('Project');

  const meta: MetaItem[] = [];
  if (detail.role) meta.push({ label: t('labelRole'), value: detail.role });

  if (detail.stack.length) {
    meta.push({ label: t('labelStack'), value: <ProjectStack items={detail.stack} /> });
  }

  if (detail.projectType) {
    meta.push({ label: tMetadata('labelType'), value: detail.projectType });
  }
  if (detail.status && tMetadata.has(`statuses.${detail.status}`)) {
    meta.push({ label: tMetadata('labelStatus'), value: tMetadata(`statuses.${detail.status}`) });
  }

  if (detail.yearLabel) {
    meta.push({ label: t('labelYear'), value: detail.yearLabel });
  }

  return (
    <article data-component="CaseStudy">
      <section className="pt-[clamp(48px,9vh,104px)] pb-[clamp(32px,6vh,64px)]">
        <AppLink
          href={`${routes.home}#${anchors.projects}`}
          internal
          arrow="left"
          arrowPosition="before"
          color="gray"
          fontMono={true}
        >
          {tProject('back')}
        </AppLink>

        <div className="grid items-start gap-[clamp(32px,6vw,88px)] pt-[clamp(20px,4vh,44px)] md:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
          <div className="grid min-w-0 gap-6">
            <div className="text-muted flex items-baseline gap-3 font-mono text-xs tracking-[0.12em]">
              <span>{detail.index}</span>
              {detail.shortLabel && (
                <>
                  <span className="text-accent-pale">/</span>
                  <span className="text-ink">{detail.shortLabel}</span>
                </>
              )}
            </div>

            <ImageFrame photo={detail.coverPhoto} compact priority />
            <h1 className="text-[clamp(32px,4vw,56px)] leading-[1.08] font-semibold tracking-[-0.038em] break-words">
              {detail.title}
            </h1>

            {detail.subtitle && (
              <p className="text-accent text-[clamp(20px,2.4vw,30px)] leading-[1.24] font-medium tracking-[-0.024em]">
                {detail.subtitle}
              </p>
            )}

            {detail.lead && (
              <p className="text-muted max-w-165 text-[clamp(17px,1.5vw,19px)] leading-[1.68] text-pretty">
                {detail.lead}
              </p>
            )}
          </div>

          {meta.length > 0 && <MetaList variant="panel" labelColor="blue" items={meta} />}
        </div>
      </section>

      {detail.features.some((feature) => feature.trim()) && (
        <section data-component="CaseStudyFeatures" className="pt-6">
          <MetaList
            variant="compact"
            labelColor="gray"
            labelWidth={120}
            items={[
              {
                label: detail.featuresTitle?.trim() || t('labelFeatures'),
                value: (
                  <ProjectFeatures features={detail.features.filter((feature) => feature.trim())} />
                ),
              },
            ]}
          />
        </section>
      )}

      {detail.sections.length > 0 && (
        <section className="grid gap-[clamp(40px,7vh,80px)] pt-[clamp(56px,10vh,128px)]">
          {detail.sections.map((section) => (
            <CaseSection key={section.id} section={section} />
          ))}
        </section>
      )}

      {detail.photos.length > 0 && (
        <section className="grid min-w-0 gap-6 pt-[clamp(56px,10vh,120px)]">
          <Label color="blue">{t('labelGallery')}</Label>
          <ImagesGallery photos={detail.photos} />
        </section>
      )}

      <section className="grid gap-7 pt-[clamp(56px,10vh,120px)] pb-[clamp(72px,12vh,140px)]">
        {(detail.externalUrl || detail.githubUrl || detail.storybookUrl) && (
          <div className="border-line flex flex-wrap items-center gap-6.5 border-t pt-5.5">
            <Label color="blue">{t('labelLinks')}</Label>
            {detail.externalUrl && (
              <AppLink
                href={detail.externalUrl}
                external
                arrow="upRight"
                variant="underline"
                color="black"
              >
                {detail.linkLabel ?? detail.externalUrl}
              </AppLink>
            )}
            {detail.githubUrl && (
              <AppLink
                href={detail.githubUrl}
                external
                arrow="upRight"
                variant="underline"
                color="black"
              >
                {t('githubLabel')}
              </AppLink>
            )}
            {detail.storybookUrl && (
              <AppLink
                href={detail.storybookUrl}
                external
                arrow="upRight"
                variant="underline"
                color="black"
              >
                {t('storybookLabel')}
              </AppLink>
            )}
            {detail.linkNote && <span className="text-muted text-[14.5px]">{detail.linkNote}</span>}
          </div>
        )}

        <div className="border-line flex flex-wrap items-center justify-between gap-6 border-t pt-6.5">
          <AppLink
            href={`${routes.home}#${anchors.projects}`}
            internal
            arrow="left"
            arrowPosition="before"
            color="gray"
          >
            {tProject('back')}
          </AppLink>

          {detail.next && (
            <Link
              href={routes.project(detail.next.slug)}
              className="text-ink hover:text-accent min-h-11 text-right text-[clamp(18px,2vw,26px)] tracking-[-0.02em] transition-colors"
            >
              {tProject('next')}: {detail.next.title} →
            </Link>
          )}
        </div>
      </section>
    </article>
  );
}
