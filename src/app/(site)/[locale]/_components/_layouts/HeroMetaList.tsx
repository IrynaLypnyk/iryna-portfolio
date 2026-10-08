'use client';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { MetaList, type MetaItem } from '@/app/(site)/[locale]/_components/_ui/MetaList';
import { useTranslations } from 'next-intl';

// Reorder these keys to change the hero metadata order on all screen sizes.
const HERO_META_ORDER = ['role', 'experience', 'expanding', 'stack', 'location', 'status'] as const;

export function HeroMetaList() {
  const t = useTranslations('Hero');
  const tCommon = useTranslations('Common');
  const tWork = useTranslations('Work');
  const { isMobile } = useBreakpoint();

  const items: Record<(typeof HERO_META_ORDER)[number], MetaItem> = {
    role: { label: tWork('labelRole'), value: tCommon('role') },
    stack: { label: tWork('labelStack'), value: tCommon('stack') },
    experience: { label: t('labelExperience'), value: t('metaExperience') },
    expanding: { label: t('labelExpanding'), value: t('metaExpanding') },
    location: { label: t('labelLocation'), value: t('location') },
    status: { label: tWork('labelStatus'), value: t('metaStatus') },
  };

  return (
    <MetaList
      variant={isMobile ? 'roomy' : 'panel'}
      labelColor="blue"
      labelWidth={86}
      items={HERO_META_ORDER.map((key) => items[key])}
    />
  );
}
