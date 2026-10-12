'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { anchors } from '@/constants/routes';

const REVEAL_SELECTOR = [
  '[data-reveal]',
  '[data-reveal-stagger] > *',
  '[data-component="SectionHeader"]',
  '[data-component="RecentProjectArticle"]',
  '[data-component="EarlierProjectArticle"]',
  '[data-component="ExperimentCard"]',
].join(',');

/** Enhance the home page after hydration, keeping server-rendered content visible without JS. */
export function HomeReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !('IntersectionObserver' in window) || !('animate' in Element.prototype)) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Map<Element, Animation>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          animations.get(entry.target)?.play();
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -24px 0px', threshold: 0 }
    );

    function clearAnimations() {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      animations.clear();
    }

    function setup() {
      clearAnimations();
      if (reducedMotion.matches) return;

      root?.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach((element) => {
        // Never hide content that is already painted, especially potential LCP elements.
        if (
          element.closest(`#${anchors.hero}`) ||
          element.getBoundingClientRect().top < window.innerHeight ||
          element.contains(document.activeElement)
        ) {
          return;
        }

        const parent = element.parentElement;
        const stagger = parent?.hasAttribute('data-reveal-stagger')
          ? Array.from(parent.children).indexOf(element)
          : 0;
        const animation = element.animate(
          [
            { opacity: 0, transform: 'translateY(18px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          {
            duration: 600,
            delay: Math.min(stagger * 65, 260),
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
            fill: 'both',
          }
        );
        animation.pause();
        animation.currentTime = 0;
        // Release the transform after appearing so sticky descendants retain their normal behavior.
        animation.onfinish = () => {
          animation.cancel();
          animations.delete(element);
        };
        animations.set(element, animation);
        observer.observe(element);
      });
    }

    function revealFocusedContent(event: FocusEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      animations.forEach((animation, element) => {
        if (!element.contains(target)) return;
        animation.cancel();
        animations.delete(element);
        observer.unobserve(element);
      });
    }

    setup();
    reducedMotion.addEventListener('change', clearAnimations);
    root.addEventListener('focusin', revealFocusedContent);

    return () => {
      clearAnimations();
      reducedMotion.removeEventListener('change', clearAnimations);
      root.removeEventListener('focusin', revealFocusedContent);
    };
  }, []);

  return (
    <div ref={ref} className="home-reveal">
      {children}
    </div>
  );
}
