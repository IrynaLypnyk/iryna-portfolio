import type { LocaleType } from '@/i18n/routing';
import { getPublishedProjects as getProjects } from '@/lib/data/projects';
import { toProjectData } from '@/lib/data/project-mappers';
export async function getPublishedProjects(locale: LocaleType) {
  return (await getProjects()).map((project) => toProjectData(project, locale));
}
