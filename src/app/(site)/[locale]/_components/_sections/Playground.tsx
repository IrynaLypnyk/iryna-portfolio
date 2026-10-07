import { useTranslations } from 'next-intl';
import { SectionHeader } from '@/app/(site)/[locale]/_components/_ui/SectionHeader';
import { Section } from '@/app/(site)/[locale]/_components/_ui/Section';
import { ExperimentCard } from '@/app/(site)/[locale]/_components/_layouts/ExperimentCard';
import { anchors } from '@/constants/routes';
import type { ExperimentData } from '@/types/experiments';

type Props = {
  experiments: ExperimentData[];
};

export function Playground({ experiments }: Props) {
  const t = useTranslations('Playground');

  return (
    <Section id={anchors.playground}>
      <SectionHeader index="02" title={t('title')} subtitle={t('intro')} />

      {experiments.length === 0 ? (
        <p className="text-app-muted pb-16 text-[17px]">{t('empty')}</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-4">
          {experiments.map((experiment) => (
            <ExperimentCard key={experiment.slug} experiment={experiment} />
          ))}
        </div>
      )}
    </Section>
  );
}
