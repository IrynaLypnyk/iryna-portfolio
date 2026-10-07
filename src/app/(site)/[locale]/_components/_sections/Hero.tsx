import { useTranslations } from 'next-intl';
import { MetaList } from '@/app/(site)/[locale]/_components/_ui/MetaList';
import { anchors } from '@/constants/routes';
import { Section } from '@/app/(site)/[locale]/_components/_ui/Section';
import { AppLink } from '@/app/(site)/[locale]/_components/_ui/AppLink';

export function Hero() {
  const t = useTranslations('Hero');
  const tCommon = useTranslations('Common');
  const tWork = useTranslations('Work');
  const role = tCommon('role');

  return (
    <Section className="hero-grid relative grid min-h-[88vh] content-center py-[clamp(48px,9vh,112px)]">
      <div className="grid items-start gap-[clamp(32px,6vw,84px)] md:grid-cols-[minmax(0,1.55fr)_minmax(0,0.72fr)]">
        <div className="grid gap-[clamp(24px,3.4vh,40px)]">
          <div className="text-app-muted flex items-center gap-3 font-mono text-xs tracking-wide">
            <div className="bg-app-accent-bright h-px w-8"></div>
            <span className="text-ink">{t('kicker')}</span>
          </div>

          <h1 className="text-app-text text-[clamp(44px,8vw,96px)] leading-[0.92] font-medium tracking-[-0.04em]">
            {t('name')}
          </h1>

          <div className="text-app-muted max-w-160 text-[clamp(16px,1.4vw,18px)] leading-normal">
            <p>{t('body', { role })}</p>
          </div>

          <div className="text-app-ink text-[clamp(24px,3.5vw,46px)] leading-snug font-semibold tracking-[-0.03em] md:leading-[1.12]">
            <p className="text-app-accent-bright">{t('statement.part1')}</p>
            <p>{t('statement.part2')}</p>
            <p>
              <span>{t('statement.part3')}</span>
            </p>
          </div>

          <AppLink
            href={`#${anchors.projects}`}
            fontMono={true}
            arrow="right"
            arrowPosition="before"
            color="blueBright"
          >
            {t('cta')}
          </AppLink>
        </div>

        <MetaList
          variant="panel"
          labelColor="blue"
          items={[
            { label: tWork('labelRole'), value: role },
            { label: tWork('labelStack'), value: tCommon('stack') },
            { label: t('labelExperience'), value: t('metaExperience') },
            { label: t('labelExpanding'), value: t('metaExpanding') },
            { label: t('labelLocation'), value: t('location') },
            { label: tWork('labelStatus'), value: t('metaStatus') },
          ]}
        />
      </div>
    </Section>
  );
}
