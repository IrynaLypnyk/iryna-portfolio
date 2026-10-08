'use client';

import { useEffect } from 'react';
import { anchors } from '@/constants/routes';

export function HashScroll() {
  useEffect(() => {
    const initialHash = window.location.hash;
    let previousScrollY = window.scrollY;
    let frameId = 0;

    const clearHashInHero = () => {
      const scrollingUp = window.scrollY < previousScrollY;
      previousScrollY = window.scrollY;

      const hash = window.location.hash;
      const targetsTop = hash === `#${anchors.hero}` || hash === `#${anchors.top}`;
      if (!hash || (!scrollingUp && !targetsTop)) return;

      const hero = document.getElementById(anchors.hero);
      if (!hero) return;

      const bounds = hero.getBoundingClientRect();
      const activationPoint = window.innerHeight * 0.42;
      if (bounds.top > activationPoint || bounds.bottom <= activationPoint) return;

      // Update only the URL, preserving the locale, query and router history state.
      window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}${window.location.search}`
      );
    };

    window.addEventListener('scroll', clearHashInHero, { passive: true });

    if (initialHash) {
      frameId = requestAnimationFrame(() => {
        frameId = requestAnimationFrame(() => {
          // A navigation or a return to Hero may have changed the target meanwhile.
          if (window.location.hash !== initialHash) return;
          const element = document.getElementById(initialHash.slice(1));
          element?.scrollIntoView();
        });
      });
    }

    return () => {
      window.removeEventListener('scroll', clearHashInHero);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return null;
}
