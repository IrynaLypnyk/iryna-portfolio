import { useTranslations } from 'next-intl';
import { MetaList } from '@/app/(site)/[locale]/_components/_ui/MetaList';
import { anchors } from '@/constants/routes';
import { ScrollToSectionLink } from '@/app/(site)/[locale]/_components/_ui/ScrollToSectionLink';
import { Section } from '@/app/(site)/[locale]/_components/_ui/Section';

export function Hero() {
  const t = useTranslations('Hero');
  const tCommon = useTranslations('Common');
  const tWork = useTranslations('Work');
  const role = tCommon('role');

  return (
    <Section className="hero-grid relative grid min-h-[88vh] content-center py-[clamp(48px,9vh,112px)]">
      <div className="grid items-start gap-[clamp(32px,6vw,84px)] md:grid-cols-[minmax(0,1.55fr)_minmax(0,0.72fr)]">
        <div className="grid gap-[clamp(24px,3.4vh,40px)]">
          <h1 className="text-app-ink text-[clamp(40px,5vw,72px)] leading-tight font-bold tracking-normal">
            {t('statement.part1')}
            <br />
            {t('statement.part2')}
            <span className="gradient-text"> {t('statement.part3')}</span>
            <br />
            {t('statement.part4')}
          </h1>
          <div className="text-app-muted max-w-160 text-[clamp(16px,1.4vw,18px)] leading-normal">
            <p>{t('body', { role })}</p>
          </div>
          <ScrollToSectionLink anchor={anchors.projects}>{t('cta')}</ScrollToSectionLink>
        </div>

        <MetaList
          variant="panel"
          labelColor="blue"
          items={[
            { label: tWork('labelRole'), value: role },
            { label: tWork('labelStack'), value: tCommon('stack') },
            { label: t('labelExperience'), value: t('metaExperience') },
            { label: t('labelLocation'), value: t('location') },
            { label: tWork('labelStatus'), value: t('metaStatus') },
          ]}
        />
      </div>
    </Section>
  );
}
