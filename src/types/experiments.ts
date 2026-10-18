import type { Photo, CaseBlock } from '@/types/projects';

/**
 * A Playground experiment, localized to a single language.
 *
 * `cover` is nullable on purpose, same as a project's cover photo: an
 * experiment is publishable before its demo screenshot exists. Photos and videos
 * use the same gallery as projects.
 */
export type ExperimentData = {
  hasDetailPage?: boolean;
  updatedAt?: Date;
  blocks?: CaseBlock[];
  slug: string;
  index: string;
  title: string;
  description: string;
  shortDescription: string;
  stack: string | null;
  demoUrl: string | null;
  githubUrl: string | null;
  cover: Photo<string> | null;
  photos: Photo<string>[];
};
