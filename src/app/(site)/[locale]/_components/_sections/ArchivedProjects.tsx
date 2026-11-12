import { useTranslations } from 'next-intl';
import type { ProjectData } from '@/types/projects';
import { SectionHeader } from '@/app/(site)/[locale]/_components/_ui/SectionHeader';
import { EarlierProjectArticle } from '@/app/(site)/[locale]/_components/_layouts/ProjectArticle/EarlierProjectArticle';

type Props = {
  projects: ProjectData[];
};

export function ArchivedProjects({ projects }: Props) {
  const t = useTranslations('Work');

  if (projects.length === 0) return null;

  return (
    <div data-component="ArchivedProjects">
      <SectionHeader
        index="02"
        title={t('moreWork.title')}
        subtitle={t('moreWork.description')}
        titleTag="h3"
        subtitleTag="h4"
        className="mt-7 mb-5 md:mt-10 md:mb-7 lg:mt-20 lg:mb-15"
      />

      <div>
        {projects.map((project, position) => (
          <EarlierProjectArticle key={project.slug} project={project} index={position + 1} />
        ))}
      </div>
    </div>
  );
}
