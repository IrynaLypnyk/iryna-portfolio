import { routes } from '@/constants/routes';
import type { ProjectData } from '@/types/projects';

type WorkTranslations = ReturnType<typeof import('next-intl').useTranslations<'Work'>>;

export function getProjectLinks(project: ProjectData, t: WorkTranslations) {
  return [
    project.hasDetailPage && {
      href: routes.project(project.slug),
      label: t('caseCta'),
      internal: true,
    },
    project.externalUrl && {
      href: project.externalUrl,
      label: project.linkLabel ?? t('demoLabel'),
    },
    project.githubUrl && { href: project.githubUrl, label: t('githubLabel') },
    project.storybookUrl && { href: project.storybookUrl, label: t('storybookLabel') },
  ].filter((link): link is { href: string; label: string; internal?: boolean } => Boolean(link));
}
