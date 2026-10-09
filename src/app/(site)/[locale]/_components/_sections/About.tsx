import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { MetaList } from '@/app/(site)/[locale]/_components/_ui/MetaList';
import { SectionHeader } from '@/app/(site)/[locale]/_components/_ui/SectionHeader';
import { anchors } from '@/constants/routes';
import { Section } from '@/app/(site)/[locale]/_components/_ui/Section';
import { TextLink } from '@/app/(site)/[locale]/_components/_ui/TextLink';

const PORTRAIT_SRC = '/images/iryna-lypnyk.webp';

export function About() {
  const t = useTranslations('About');
  const tCommon = useTranslations('Common');

  const outsideValue = (
    <>
      {t('outside.p1')}{' '}
      <TextLink href="https://www.womencodingcommunity.com/" isExternal={true}>
        {t('outside.p2')}
      </TextLink>
    </>
  );

  return (
    <Section id={anchors.about}>
      <SectionHeader index="03" title={t('title')} />
      <div className="grid items-start gap-[clamp(32px,6vw,88px)] md:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <figure className="m-0 grid gap-3">
          <div className="bg-shell relative aspect-4/5 w-full">
            <Image
              src={PORTRAIT_SRC}
              alt={tCommon('name')}
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover object-[50%_22%]"
            />
          </div>
        </figure>

        <div className="text-app-text grid max-w-155 gap-5 text-base tracking-normal text-pretty md:text-lg">
          <p className="text-xl leading-normal text-pretty md:text-2xl">
            {t('p1', { role: tCommon('role') })}
          </p>
          <p className="leading-relaxed text-pretty">
            {t('p2.p2-1')}{' '}
            <TextLink href="https://helsi.me" isExternal={true}>
              {t('p2.p2-2')}
            </TextLink>
            {t('p2.p2-3')}
          </p>
          <p className="leading-relaxed text-pretty">{t('p3')}</p>

          <MetaList
            variant="compact"
            labelColor="blue"
            labelWidth={110}
            className="border-app-line border-t pt-6.5"
            items={[
              { label: t('labelCurrently'), value: t('currently') },
              { label: t('labelLearning'), value: t('learning') },
              { label: t('labelOutside'), value: outsideValue },
            ]}
          />
        </div>
      </div>
    </Section>
  );
}
