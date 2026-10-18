import type { ProjectStatus } from '@/generated/prisma/enums';

/**
 * A portfolio project, localized to a single language.
 *
 * `coverPhoto` is nullable on purpose: a project is publishable before its
 * screenshot exists, and the home page renders an empty `ImageFrame` in that case.
 */
export type ProjectData = {
  hasDetailPage?: boolean;
  preserveOverviewExpansion?: boolean;
  slug: string;
  shortLabel: string | null;
  title: string;
  subtitle: string | null;
  context: string | null;
  role: string | null;
  stack: string[];
  projectType: string | null;
  status: ProjectStatus;
  yearLabel: string | null;
  featured: boolean;
  order: number;
  coverPhoto: Photo<string> | null;
  featuresTitle?: string | null;
  features: string[];
  externalUrl: string | null;
  linkLabel: string | null;
  githubUrl: string | null;
  storybookUrl: string | null;
  photos: Photo<string>[];
};

/** A localized case study with its sections, photos, and next project. */
export type ProjectDetail = ProjectData & {
  index: string;
  lead: string | null;
  linkNote: string | null;
  sections: CaseBlock[];
  next: { slug: string; title: string } | null;
};

/**
 * A single image, already resolved to an absolute CDN URL.
 * `TText` is the alt/caption carrier: `LocalizedText` straight out of the DB
 * mappers, `string` once a locale has been picked.
 */
export type Photo<TText> = {
  /** Missing on legacy image assets. */
  mimeType?: string | null;
  id: string;
  src: string;
  width: number;
  height: number;
  alt: TText;
  /** Where a gallery thumbnail links out to, if anywhere. */
  linkUrl: string | null;
  /** Short caption shown on hover in the case-study gallery. */
  description: TText | null;
};

export type CaseBlock = {
  id: string;
  index: string;
  title: string | null;
  body: string | null;
  photos: Photo<string>[];
};
