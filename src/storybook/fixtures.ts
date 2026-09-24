import type { Photo, ProjectData } from '@/types/projects';

/**
 * Fixtures shared by the component stories. Kept out of the story files so a
 * change to `ProjectData` surfaces as one type error here rather than a dozen.
 */

export const samplePhoto: Photo<string> = {
  id: 'photo-1',
  src: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=1600&q=80',
  width: 1600,
  height: 1000,
  alt: 'A laptop on a desk showing a dashboard interface',
};

export const featuredProject: ProjectData = {
  slug: 'atlas-design-system',
  shortLabel: 'Atlas',
  title: 'A design system that survived three rebrands',
  subtitle: 'Design system',
  context:
    'Tokens, primitives and docs for a product team of twelve. Shipping a rebrand went from a six-week slog to a one-day token swap.',
  role: 'Lead frontend engineer',
  stack: 'Next.js · TypeScript · Tailwind',
  status: 'Live',
  yearLabel: '2024',
  featured: true,
  order: 1,
  coverPhoto: samplePhoto,
};

/** Same shape, no cover — exercises the `ImageFrame` placeholder path. */
export const projectWithoutCover: ProjectData = {
  ...featuredProject,
  slug: 'north-star-analytics',
  shortLabel: 'North Star',
  title: 'Analytics that answer one question well',
  context: 'A reporting surface built around a single funnel view instead of a wall of charts.',
  stack: 'React · D3',
  status: 'In progress',
  yearLabel: '2025',
  coverPhoto: null,
};

/** Minimal project: every optional field null, to check the layout never collapses. */
export const sparseProject: ProjectData = {
  slug: 'field-notes',
  shortLabel: 'Field Notes',
  title: 'Field Notes',
  subtitle: '',
  context: 'A small writing tool.',
  role: 'Solo',
  stack: null,
  status: null,
  yearLabel: null,
  featured: false,
  order: 9,
  coverPhoto: null,
};

export const moreWorkProject: ProjectData = {
  ...sparseProject,
  slug: 'ledger',
  shortLabel: 'Ledger',
  title: 'Ledger',
  context: 'A double-entry bookkeeping engine with a deliberately boring API.',
  stack: 'Node · Postgres',
  yearLabel: '2023',
};

export const projectList: ProjectData[] = [
  featuredProject,
  { ...projectWithoutCover, order: 2 },
  moreWorkProject,
  sparseProject,
];
