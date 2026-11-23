'use client';

import { useTranslations } from 'next-intl';
import { CaseStudySkeleton } from '@/app/(site)/[locale]/_components/_ui/CaseStudySkeleton';

export default function ExperimentLoading() {
  const t = useTranslations('Playground');

  return <CaseStudySkeleton label={t('loading')} />;
}
