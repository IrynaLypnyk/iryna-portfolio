'use client';

import { useTranslations } from 'next-intl';
import { CaseStudySkeleton } from '@/app/(site)/[locale]/_components/_ui/CaseStudySkeleton';

export default function ProjectLoading() {
  const t = useTranslations('Project');

  return <CaseStudySkeleton label={t('loading')} />;
}
