import { ProjectStack } from '@/app/(site)/[locale]/_components/_ui/ProjectStack';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';
import type { LocaleType } from '@/i18n/routing';
import { ImageFrame } from '@/app/(site)/[locale]/_components/_ui/ImageFrame';
import { MetaList, type MetaItem } from '@/app/(site)/[locale]/_components/_ui/MetaList';
import { AppLink } from '@/app/(site)/[locale]/_components/_ui/AppLink';
import { CaseSection } from '@/app/(site)/[locale]/projects/[slug]/_components/CaseSection';
import { anchors, routes } from '@/constants/routes';
import { toProjectDetail } from '@/lib/data/project-mappers';
import { getAllProjectSlugsForSitemap, getPublishedProjects } from '@/lib/data/projects';
import { buildAlternates } from '@/lib/seo/config';
import { Label } from '@/app/(site)/[locale]/_components/_ui/Label';

type Props = {
  params: Promise<{ locale: LocaleType; slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugsForSitemap();

  return slugs.map(({ slug }) => ({ slug }));
}

/**
 * Resolves one project plus its neighbours. The case study needs the sibling
 * list to compute its own number and the "Next project" link, so the whole
 * published set is fetched (from cache) rather than a single row.
 */
async function loadDetail(slug: string, locale: LocaleType) {
  const projects = await getPublishedProjects();
  const project = projects.find((candidate) => candidate.slug === slug);

  return project ? toProjectDetail(project, projects, locale) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const detail = await loadDetail(slug, locale);

  if (!detail) {
    return {};
  }

  return {
    title: detail.title,
    description: detail.lead,
    alternates: buildAlternates(routes.project(slug), locale),
    openGraph: {
      title: detail.title,
      description: detail.lead,
      ...(detail.coverPhoto ? { images: [{ url: detail.coverPhoto.src }] } : {}),
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const detail = await loadDetail(slug, locale);

  if (!detail) {
    notFound();
  }

  const t = await getTranslations('Work');
  const tMetadata = await getTranslations('ProjectMetadata');
  const tProject = await getTranslations('Project');

  const meta: MetaItem[] = [{ label: t('labelRole'), value: detail.role }];

  if (detail.stack.length) {
    meta.push({ label: t('labelStack'), value: <ProjectStack items={detail.stack} /> });
  }

  // Older cached payloads may predate the enum fields.
  if (detail.type && tMetadata.has(`types.${detail.type}`)) {
    meta.push({ label: tMetadata('labelType'), value: tMetadata(`types.${detail.type}`) });
  }
  if (detail.status && tMetadata.has(`statuses.${detail.status}`)) {
    meta.push({ label: tMetadata('labelStatus'), value: tMetadata(`statuses.${detail.status}`) });
  }

  if (detail.yearLabel) {
    meta.push({ label: t('labelYear'), value: detail.yearLabel });
  }

  const [detailA, detailB] = detail.photos.slice(1, 3);

  return (
    <article data-component="CaseStudy">
      <section className="pt-[clamp(48px,9vh,104px)] pb-[clamp(32px,6vh,64px)]">
        <AppLink
          href={`${routes.home}#${anchors.projects}`}
          arrow="left"
          arrowPosition="before"
          color="gray"
          fontMono={true}
        >
          {tProject('back')}
        </AppLink>

        <div className="grid items-start gap-[clamp(32px,6vw,88px)] pt-[clamp(20px,4vh,44px)] md:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
          <div className="grid gap-6">
            <div className="text-muted flex items-baseline gap-3 font-mono text-xs tracking-[0.12em]">
              <span>{detail.index}</span>
              <span className="text-accent-pale">/</span>
              <span className="text-ink">{detail.shortLabel}</span>
            </div>

            <h1 className="text-[clamp(40px,6.4vw,88px)] leading-[0.94] font-semibold tracking-[-0.038em]">
              {detail.title}
            </h1>

            <p className="text-accent text-[clamp(20px,2.4vw,30px)] leading-[1.24] font-medium tracking-[-0.024em]">
              {detail.subtitle}
            </p>

            <p className="text-muted max-w-165 text-[clamp(17px,1.5vw,19px)] leading-[1.68] text-pretty">
              {detail.lead}
            </p>
          </div>

          <MetaList variant="panel" labelColor="blue" items={meta} />
        </div>
      </section>

      <ImageFrame
        photo={detail.photos[0] ?? null}
        placeholder={tProject('mainVisual')}
        priority
        sizes="(min-width: 1280px) 1280px, 100vw"
        className="aspect-video"
      />

      {detail.sections.length > 0 && (
        <section className="grid gap-[clamp(40px,7vh,80px)] pt-[clamp(56px,10vh,128px)]">
          {detail.sections.map((section) => (
            <CaseSection key={section.id} section={section} />
          ))}
        </section>
      )}

      {(detailA || detailB) && (
        <section className="grid gap-[clamp(16px,2.5vw,28px)] pt-[clamp(56px,10vh,120px)] sm:grid-cols-2">
          <ImageFrame
            photo={detailA ?? null}
            placeholder={tProject('detailVisual')}
            sizes="(min-width: 640px) 50vw, 100vw"
            className="aspect-4/3"
          />
          <ImageFrame
            photo={detailB ?? null}
            placeholder={tProject('detailVisual')}
            sizes="(min-width: 640px) 50vw, 100vw"
            className="aspect-4/3"
          />
        </section>
      )}

      <section className="grid gap-7 pt-[clamp(56px,10vh,120px)] pb-[clamp(72px,12vh,140px)]">
        {detail.externalUrl && (
          <div className="border-line flex flex-wrap items-center gap-6.5 border-t pt-5.5">
            <Label color="blue">{t('labelLinks')}</Label>
            <AppLink
              href={detail.externalUrl}
              external
              arrow="upRight"
              variant="underline"
              color="black"
            >
              {detail.linkLabel ?? detail.externalUrl}
            </AppLink>
            {detail.linkNote && <span className="text-muted text-[14.5px]">{detail.linkNote}</span>}
          </div>
        )}

        <div className="border-line flex flex-wrap items-center justify-between gap-6 border-t pt-6.5">
          <AppLink
            href={`${routes.home}#${anchors.projects}`}
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
