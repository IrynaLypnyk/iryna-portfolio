'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

const SCROLL_THRESHOLD = 400;

export function BackToTopButton() {
  const t = useTranslations('Common');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        setIsVisible(window.scrollY > SCROLL_THRESHOLD);
        rafId = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  const handleClick = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={t('backToTop')}
      data-component="BackToTopButton"
      className={cn(
        'fixed right-4 bottom-5 z-50 sm:right-6',
        'flex h-11 w-11 cursor-pointer items-center justify-center rounded-full',
        'bg-app-page text-app-ink shadow-lg',
        'border-app-line border',
        'hover:bg-app-accent-bright hover:text-app-on-dark active:bg-app-accent',
        'transition-all',
        isVisible ? 'translate-y-0 opacity-70' : 'pointer-events-none translate-y-4 opacity-0'
      )}
    >
      <ArrowUp className="h-5 w-5" strokeWidth={1.5} />
    </button>
  );
}
