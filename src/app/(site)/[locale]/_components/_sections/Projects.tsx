import { anchors } from '@/constants/routes';
import type { ProjectData } from '@/types/projects';
import { Section } from '@/app/(site)/[locale]/_components/_ui/Section';
import { RecentProjects } from '@/app/(site)/[locale]/_components/_sections/RecentProjects';
import { ArchivedProjects } from '@/app/(site)/[locale]/_components/_sections/ArchivedProjects';

type Props = {
  projects: ProjectData[];
};

export function Projects({ projects }: Props) {
  const recentProjects = projects.filter((project) => project.featured);
  const archivedProjects = projects.filter((project) => !project.featured);

  return (
    <Section id={anchors.projects} className="border-none">
      <RecentProjects projects={recentProjects} isPortfolioEmpty={projects.length === 0} />
      <ArchivedProjects projects={archivedProjects} />
    </Section>
  );
}
