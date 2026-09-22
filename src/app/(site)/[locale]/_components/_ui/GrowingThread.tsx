'use client';

import { useEffect, useRef } from 'react';

/** Opacity ramps for the two stitches, as [start, end] fractions of scroll progress. */
const BRANCH_1_RANGE = [0.62, 0.74] as const;
const BRANCH_2_RANGE = [0.7, 0.82] as const;

/** The end mark starts drawing here and completes at the bottom of the page. */
const MARK_START = 0.88;
const MARK_SPAN = 0.12;

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/** Progress of `value` through a [start, end] window, clamped to 0…1. */
function ramp(value: number, [start, end]: readonly [number, number]): number {
  return clamp01((value - start) / (end - start));
}

export function GrowingThread() {
  const stemRef = useRef<SVGPathElement>(null);
  const branch1Ref = useRef<SVGPathElement>(null);
  const branch2Ref = useRef<SVGPathElement>(null);
  const markRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stem = stemRef.current;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let stemLength = 0;

    if (stem) {
      stemLength = stem.getTotalLength();
      stem.style.strokeDasharray = String(stemLength);
      stem.style.strokeDashoffset = String(stemLength * 0.9);

      if (!prefersReducedMotion) {
        stem.style.transition = 'stroke-dashoffset 200ms linear';
      }
    }

    function paint() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const scrollY = window.scrollY || doc.scrollTop || 0;

      const progress = prefersReducedMotion ? 1 : clamp01(max > 0 ? scrollY / max : 0);

      // The stem starts 10% drawn so the gutter is never bare, and completes
      // slightly before the very bottom of the document.
      if (stem && stemLength) {
        const drawn = Math.min(1, 0.1 + (progress / 0.9) * 0.9);
        stem.style.strokeDashoffset = String(stemLength * (1 - drawn));
      }

      const fade = (element: SVGElement | null, range: readonly [number, number]) => {
        if (element) {
          element.style.opacity = String(ramp(progress, range));
        }
      };

      fade(branch1Ref.current, BRANCH_1_RANGE);
      fade(branch2Ref.current, BRANCH_2_RANGE);

      const mark = markRef.current;

      if (mark) {
        const bloom = clamp01((progress - MARK_START) / MARK_SPAN);
        mark.style.opacity = bloom > 0 ? '1' : '0';

        // Each cross draws in turn: stretching `bloom` across the stroke count
        // and offsetting by index gives a sequential stitching effect rather
        // than all four appearing at once.
        const strokes = mark.querySelectorAll('path');

        strokes.forEach((stroke, index) => {
          if (!stroke.dataset.len) {
            const length = stroke.getTotalLength();
            stroke.dataset.len = String(length);
            stroke.style.strokeDasharray = String(length);

            if (!prefersReducedMotion) {
              stroke.style.transition = 'stroke-dashoffset 160ms linear';
            }
          }

          const length = Number(stroke.dataset.len);
          const local = clamp01(bloom * (strokes.length + 0.6) - index);
          stroke.style.strokeDashoffset = String(length * (1 - local));
        });
      }
    }

    paint();

    if (prefersReducedMotion) {
      return;
    }

    let frameId = 0;
    let lastScrollY = -1;

    const tick = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;

      if (scrollY !== lastScrollY) {
        lastScrollY = scrollY;
        paint();
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    // The document can grow or shrink without scrolling (images settling, a
    // locale swap changing copy length), which moves every progress threshold.
    const handleResize = () => paint();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      data-component="GrowingThread"
      className="pointer-events-none fixed top-0 left-5 z-2 hidden h-screen w-15 overflow-visible md:block xl:left-10"
    >
      <svg aria-hidden="true" viewBox="0 0 60 900" preserveAspectRatio="none">
        <path
          ref={stemRef}
          d="M30 44 L30 250 C30 288 40 296 40 334 L40 560 C40 598 30 606 30 644 L30 772"
          fill="none"
          stroke="var(--color-app-accent)"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <path
          ref={branch1Ref}
          d="M30 692 L41 681"
          fill="none"
          stroke="var(--color-app-accent)"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0"
        />
        <path
          ref={branch2Ref}
          d="M30 726 L20 716"
          fill="none"
          stroke="var(--color-app-accent)"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0"
        />
      </svg>
      <div
        ref={markRef}
        data-component="ThreadMark"
        aria-hidden="true"
        className="pointer-events-none fixed left-8.5 z-2 hidden h-8 w-8 opacity-0 md:block xl:left-13.5"
        style={{ top: 'calc(85.8vh + 16px)' }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          className="block"
          fill="none"
          stroke="var(--color-app-accent)"
          strokeLinecap="square"
        >
          {/* top left */}
          <path d="M4 4 L11 11 M11 4 L4 11" />

          {/* top right */}
          <path d="M21 4 L28 11 M28 4 L21 11" />

          {/* bottom left */}
          <path d="M4 21 L11 28 M11 21 L4 28" />

          {/* bottom right */}
          <path d="M21 21 L28 28 M28 21 L21 28" />

          {/* small center x */}
          <path d="M14 14 L18 18 M18 14 L14 18" />
        </svg>
      </div>
    </div>
  );
}
