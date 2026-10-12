'use client';

import { useTranslations } from 'next-intl';

export default function ExperimentLoading() {
  const t = useTranslations('Playground');

  return (
    <div
      role="status"
      aria-busy="true"
      className="pt-[clamp(48px,9vh,104px)] pb-[clamp(72px,12vh,140px)]"
    >
      <span className="sr-only">{t('loading')}</span>
      <div aria-hidden="true" className="grid animate-pulse gap-6 motion-reduce:animate-none">
        <div className="bg-shell h-4 w-48" />
        <div className="grid items-start gap-[clamp(32px,6vw,88px)] pt-[clamp(20px,4vh,44px)] pb-[clamp(32px,6vh,64px)] md:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
          <div className="grid gap-6">
            <div className="bg-shell h-3 w-32" />
            <div className="bg-shell h-[clamp(40px,6.4vw,88px)] w-4/5" />
            <div className="grid gap-3">
              <div className="bg-shell h-5 w-full" />
              <div className="bg-shell h-5 w-2/3" />
            </div>
          </div>
          <div className="border-app-line bg-shell h-32 border" />
        </div>
        <div className="border-app-line bg-shell aspect-video border" />
      </div>
    </div>
  );
}
