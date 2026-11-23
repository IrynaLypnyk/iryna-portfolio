import { CaseStudyLayout } from './CaseStudyLayout';
import { useTranslations } from 'next-intl';
import type { ProjectDetail } from '@/types/projects';
import { ProjectStack } from '@/app/(site)/[locale]/_components/_layouts/ProjectArticle/ProjectStack';
import { type MetaItem } from '@/app/(site)/[locale]/_components/_ui/MetaList';
import { AppLink } from '@/app/(site)/[locale]/_components/_ui/AppLink';
import { anchors, routes } from '@/constants/routes';
export function ProjectCaseStudy({ detail }: { detail: ProjectDetail }) {
  const t = useTranslations('Work');
  const tMetadata = useTranslations('ProjectMetadata');
  const tProject = useTranslations('Project');

  const meta: MetaItem[] = [];
  if (detail.role) meta.push({ label: t('labelRole'), value: detail.role });

  if (detail.projectType) {
    meta.push({ label: tMetadata('labelType'), value: detail.projectType });
  }

  if (detail.stack.length) {
    meta.push({ label: t('labelStack'), value: <ProjectStack items={detail.stack} /> });
  }

  if (detail.status && tMetadata.has(`statuses.${detail.status}`)) {
    meta.push({ label: tMetadata('labelStatus'), value: tMetadata(`statuses.${detail.status}`) });
  }

  if (detail.yearLabel) {
    meta.push({ label: t('labelYear'), value: detail.yearLabel });
  }

  if (detail.externalUrl || detail.githubUrl || detail.storybookUrl) {
    meta.push({
      label: t('labelLinks'),
      value: (
        <div className="flex flex-wrap gap-x-5 gap-y-3">
          {detail.externalUrl && (
            <AppLink href={detail.externalUrl} external arrow="upRight" color="blueBright">
              {detail.linkLabel ?? detail.externalUrl}
            </AppLink>
          )}
          {detail.githubUrl && (
            <AppLink href={detail.githubUrl} external arrow="upRight" color="blueBright">
              {t('githubLabel')}
            </AppLink>
          )}
          {detail.storybookUrl && (
            <AppLink href={detail.storybookUrl} external arrow="upRight" color="blueBright">
              {t('storybookLabel')}
            </AppLink>
          )}
          {detail.linkNote && <span className="text-muted text-[14.5px]">{detail.linkNote}</span>}
        </div>
      ),
    });
  }

  return (
    <CaseStudyLayout
      componentName="CaseStudy"
      title={detail.title}
      subtitle={detail.subtitle}
      description={detail.lead}
      cover={detail.coverPhoto}
      meta={meta}
      sections={detail.sections}
      photos={detail.photos}
      galleryLabel={t('labelGallery')}
      backHref={`${routes.home}#${anchors.projects}`}
      backLabel={tProject('back')}
      next={
        detail.next ? { href: routes.project(detail.next.slug), title: detail.next.title } : null
      }
      nextLabel={tProject('next')}
    ></CaseStudyLayout>
  );
}
