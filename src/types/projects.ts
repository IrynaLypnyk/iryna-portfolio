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
