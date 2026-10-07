'use client';

import { useEffect, useState } from 'react';

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  useEffect(() => {
    const tablet = window.matchMedia('(min-width: 768px)');
    const desktop = window.matchMedia('(min-width: 1024px)');

    const updateBreakpoint = () => {
      if (desktop.matches) {
        setBreakpoint('desktop');
      } else if (tablet.matches) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('mobile');
      }
    };

    updateBreakpoint();

    tablet.addEventListener('change', updateBreakpoint);
    desktop.addEventListener('change', updateBreakpoint);

    return () => {
      tablet.removeEventListener('change', updateBreakpoint);
      desktop.removeEventListener('change', updateBreakpoint);
    };
  }, []);

  return {
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
  };
}
