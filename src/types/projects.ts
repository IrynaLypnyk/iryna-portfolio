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
  status: string | null;
  yearLabel: string | null;
  featured: boolean;
  order: number;
  coverPhoto: Photo<string> | null;
};

/** A localized case study with its sections, photos, and next project. */
export type ProjectDetail = ProjectData & {
  index: string;
  lead: string;
  externalUrl: string | null;
  linkLabel: string | null;
  linkNote: string | null;
  sections: {
    id: string;
    index: string;
    title: string;
    body: string;
    body2: string | null;
  }[];
  photos: Photo<string>[];
  next: { slug: string; title: string } | null;
};

/**
 * A single image, already resolved to an absolute CDN URL.
 * `TText` is the alt/caption carrier: `LocalizedText` straight out of the DB
 * mappers, `string` once a locale has been picked.
 */
export type Photo<TText> = {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: TText;
};
