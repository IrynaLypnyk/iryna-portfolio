import { useTranslations } from 'next-intl';
import { anchors } from '@/constants/routes';
import { Section } from '@/app/(site)/[locale]/_components/_ui/Section';
import { AppLink } from '@/app/(site)/[locale]/_components/_ui/AppLink';
import { HeroMetaList } from '@/app/(site)/[locale]/_components/_layouts/HeroMetaList';
import { Kicker } from '@/app/(site)/[locale]/_components/_ui/Kicker';

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
          <Kicker withRule>{t('kicker')}</Kicker>
          <h1 className="text-app-ink text-[clamp(2.875rem,calc(1.1389rem+6vw),6rem)] leading-none font-medium tracking-tight">
            {t('name')}
          </h1>

          <div className="text-app-ink text-[clamp(1.5rem,calc(0.7361rem+2.4444vw),2.875rem)] leading-tight font-semibold tracking-tight">
            <p>{t('statement.part1')}</p>
            <p>{t('statement.part2')}</p>
            <p>
              <span className="text-app-accent-bright">{t('statement.part3')}</span>
            </p>
          </div>
          <div className="text-app-muted max-w-160 text-base leading-normal lg:text-lg">
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
