'use client';

import { useEffect } from 'react';

export function HashScroll() {
  useEffect(() => {
    const id = window.location.hash.slice(1);

    if (!id) return;

    const scrollToHash = () => {
      const element = document.getElementById(id);
      element?.scrollIntoView();
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(scrollToHash);
    });
  }, []);

  return null;
}
