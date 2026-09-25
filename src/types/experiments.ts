import type { Photo } from '@/types/projects';

/**
 * A Playground experiment, localized to a single language.
 *
 * `cover` is nullable on purpose, same as a project's cover photo: an
 * experiment is publishable before its demo screenshot exists.
 */
export type ExperimentData = {
  slug: string;
  index: string;
  title: string;
  description: string;
  stack: string | null;
  demoUrl: string | null;
  githubUrl: string | null;
  cover: Photo<string> | null;
};
