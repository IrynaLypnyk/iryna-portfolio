import { useTranslations } from 'next-intl';
import { SectionHeader } from '@/app/(site)/[locale]/_components/_ui/SectionHeader';
import { anchors } from '@/constants/routes';
import type { ProjectData } from '@/types/projects';
import { RecentProjectArticle } from '@/app/(site)/[locale]/_components/_layouts/RecentProjectArticle';
import { Section } from '@/app/(site)/[locale]/_components/_ui/Section';

type Props = {
  projects: ProjectData[];
};

export function Projects({ projects }: Props) {
  const t = useTranslations('Work');

  const featured = projects.filter((project) => project.featured);
  const moreWork = projects.filter((project) => !project.featured);

  return (
    <Section id={anchors.projects}>
      <div>
        <SectionHeader
          index="01"
          title={t('recentWork.title')}
          subtitle={t('recentWork.description')}
        />

        {featured.length === 0 && moreWork.length === 0 && (
          <p className="text-app-muted pb-16 text-[17px]">{t('empty')}</p>
        )}
        <div>
          {featured.map((project, position) => (
            <RecentProjectArticle key={project.slug} project={project} index={position + 1} />
          ))}
        </div>
      </div>
      {moreWork.length > 0 && (
        <div className="grid pt-6">
          <SectionHeader
            title={t('moreWork.title')}
            subtitle={t('moreWork.description')}
            titleTag="h3"
            subtitleTag="h4"
          />

          <div>
            {moreWork.map((project, position) => (
              <RecentProjectArticle key={project.slug} project={project} index={position + 1} />
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}
