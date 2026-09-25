import { useTranslations } from 'next-intl';
import { Kicker } from '@/app/(site)/[locale]/_components/_ui/Kicker';
import { SectionHeader } from '@/app/(site)/[locale]/_components/_ui/SectionHeader';
import { anchors } from '@/constants/routes';
import type { ProjectData } from '@/types/projects';
import { MoreWorkRow } from '@/app/(site)/[locale]/_components/_layouts/MoreWorkRow';
import { ProjectArticle } from '@/app/(site)/[locale]/_components/_layouts/ProjectArticle';
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
      <SectionHeader index="01" title={t('title')} />

      <p className="text-app-text pb-8 font-mono text-[17px]">{t('description')}</p>

      {featured.length === 0 && moreWork.length === 0 && (
        <p className="text-app-muted pb-16 text-[17px]">{t('empty')}</p>
      )}

      {featured.map((project, position) => (
        <ProjectArticle
          key={project.slug}
          project={project}
          index={position + 1}
          isLast={position === featured.length - 1}
        />
      ))}

      {moreWork.length > 0 && (
        <div className="border-app-line grid border-t pt-6">
          <Kicker as="h4" className="mb-2 font-medium">
            {t('moreWork')}
          </Kicker>

          {moreWork.map((project) => (
            <MoreWorkRow key={project.slug} project={project} />
          ))}

          <p className="text-app-muted mt-4.5 text-[13.5px]">{t('archiveNote')}</p>
        </div>
      )}
    </Section>
  );
}
