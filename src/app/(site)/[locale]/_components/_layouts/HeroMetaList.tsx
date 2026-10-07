'use client';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { MetaList } from '@/app/(site)/[locale]/_components/_ui/MetaList';
import { useTranslations } from 'next-intl';

export function HeroMetaList() {
  const t = useTranslations('Hero');
  const tCommon = useTranslations('Common');
  const tWork = useTranslations('Work');
  const role = tCommon('role');
  const { isMobile } = useBreakpoint();

  return (
    <MetaList
      variant={isMobile ? 'roomy' : 'panel'}
      labelColor="blue"
      labelWidth={86}
      items={[
        { label: tWork('labelRole'), value: role },
        { label: tWork('labelStack'), value: tCommon('stack') },
        { label: t('labelExperience'), value: t('metaExperience') },
        { label: t('labelExpanding'), value: t('metaExpanding') },
        { label: t('labelLocation'), value: t('location') },
        { label: tWork('labelStatus'), value: t('metaStatus') },
      ]}
    />
  );
}
