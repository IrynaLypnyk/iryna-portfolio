import { useTranslations } from 'next-intl';
import { SectionHeader } from '@/app/(site)/[locale]/_components/_ui/SectionHeader';
import { anchors } from '@/constants/routes';
import type { ProjectData } from '@/types/projects';
import { RecentProjectArticle } from '@/app/(site)/[locale]/_components/_layouts/RecentProjectArticle';
import { Section } from '@/app/(site)/[locale]/_components/_ui/Section';
import { EarlierProjectArticle } from '@/app/(site)/[locale]/_components/_layouts/EarlierProjectArticle';

type Props = {
  projects: ProjectData[];
};

export function Projects({ projects }: Props) {
  const t = useTranslations('Work');

  const featured = projects.filter((project) => project.featured);
  const moreWork = projects.filter((project) => !project.featured);

  return (
    <Section id={anchors.projects} className="border-none pb-0">
      <div>
        <SectionHeader
          index="01"
          title={t('recentWork.title')}
          subtitle={t('recentWork.description')}
          className="mb-5 md:mb-7 lg:mb-15"
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
        <div>
          <SectionHeader
            title={t('moreWork.title')}
            subtitle={t('moreWork.description')}
            titleTag="h3"
            subtitleTag="h4"
            className="mt-7 mb-5 md:mt-10 md:mb-7 lg:mt-20 lg:mb-15"
          />

          <div>
            {moreWork.map((project, position) => (
              <EarlierProjectArticle key={project.slug} project={project} index={position + 1} />
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}
