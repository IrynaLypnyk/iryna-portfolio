import type { ProjectType, ProjectStatus } from '@/generated/prisma/enums';

/**
 * A portfolio project, localized to a single language.
 *
 * `coverPhoto` is nullable on purpose: a project is publishable before its
 * screenshot exists, and the home page renders an empty `ImageFrame` in that case.
 */
export type ProjectData = {
  slug: string;
  shortLabel: string;
  title: string;
  subtitle: string;
  context: string;
  role: string;
  stack: string | null;
  type: ProjectType;
  status: ProjectStatus;
  yearLabel: string | null;
  featured: boolean;
  order: number;
  coverPhoto: Photo<string> | null;
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
  lead: string;
  linkNote: string | null;
  sections: {
    id: string;
    index: string;
    title: string;
    body: string;
    body2: string | null;
  }[];
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
