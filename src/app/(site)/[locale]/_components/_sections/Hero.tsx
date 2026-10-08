import { useTranslations } from 'next-intl';
import { anchors } from '@/constants/routes';
import { Section } from '@/app/(site)/[locale]/_components/_ui/Section';
import { AppLink } from '@/app/(site)/[locale]/_components/_ui/AppLink';
import { HeroMetaList } from '@/app/(site)/[locale]/_components/_layouts/HeroMetaList';

export function Hero() {
  const t = useTranslations('Hero');
  const tCommon = useTranslations('Common');
  const role = tCommon('role');

  return (
    <Section
      id={anchors.hero}
      className="hero-grid relative grid min-h-[88vh] content-center py-[clamp(48px,9vh,112px)]"
    >
      <div className="grid items-start gap-[clamp(32px,6vw,84px)] md:grid-cols-[minmax(0,1.55fr)_minmax(0,0.72fr)]">
        <div className="grid gap-[clamp(24px,3.4vh,40px)]">
          <div className="text-app-muted flex items-center gap-3 font-mono text-xs tracking-wide">
            <span className="bg-app-muted/50 inline-block h-px w-6 align-middle"></span>
            <span className="text-app-muted">{t('kicker')}</span>
          </div>
          <h1 className="text-app-ink text-[clamp(44px,8vw,96px)] leading-[0.92] font-medium tracking-[-0.04em]">
            {t('name')}
          </h1>

          <div className="text-app-ink text-[clamp(24px,3.5vw,46px)] leading-[1.12] font-semibold tracking-[-0.03em]">
            <p>{t('statement.part1')}</p>
            <p>{t('statement.part2')}</p>
            <p>
              <span className="text-app-accent-bright">{t('statement.part3')}</span>
            </p>
          </div>
          <div className="text-app-muted max-w-160 text-[clamp(16px,1.4vw,18px)] leading-normal">
            <p>{t('body', { role })}</p>
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

        <HeroMetaList />
      </div>
    </Section>
  );
}
