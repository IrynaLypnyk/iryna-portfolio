import { useTranslations } from 'next-intl';
import type { ProjectData } from '@/types/projects';
import { SectionHeader } from '@/app/(site)/[locale]/_components/_ui/SectionHeader';
import { RecentProjectArticle } from '@/app/(site)/[locale]/_components/_layouts/ProjectArticle/RecentProjectArticle';

type Props = {
  projects: ProjectData[];
  isPortfolioEmpty?: boolean;
};

export function RecentProjects({ projects, isPortfolioEmpty = false }: Props) {
  const t = useTranslations('Work');

  return (
    <div data-component="RecentProjects">
      <SectionHeader
        title={t('recentWork.title')}
        subtitle={t('recentWork.description')}
        className="mb-5 md:mb-7 lg:mb-15"
      />

      {isPortfolioEmpty && <p className="text-app-muted pb-16 text-[17px]">{t('empty')}</p>}
      <div>
        {projects.map((project, position) => (
          <RecentProjectArticle key={project.slug} project={project} index={position + 1} />
        ))}
      </div>
    </div>
  );
}
