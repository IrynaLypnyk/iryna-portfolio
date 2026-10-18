import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import { unstable_cache } from 'next/cache';

import { detailPublished, publicPhotos, publicBlocks } from './public-media';
const projectInclude = {
  photos: {
    ...publicPhotos,
    orderBy: [{ orderInProject: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
  },
  coverAsset: true,
  coverAssetUk: true,
} satisfies Prisma.ProjectInclude;

export async function getPublishedProjectDetail(slug: string) {
  return prisma.project.findFirst({
    where: { slug, ...detailPublished },
    include: { ...projectInclude, contentBlocks: publicBlocks },
  });
}

export async function getDetailProjectNeighbours() {
  return prisma.project.findMany({
    where: detailPublished,
    orderBy: [{ featured: 'desc' }, { order: 'asc' }, { id: 'asc' }],
    select: {
      slug: true,
      titleEn: true,
      titleUk: true,
      featured: true,
      published: true,
      detailPageStatus: true,
    },
  });
}

export type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: typeof projectInclude;
}>;

export async function getPublishedProjects(): Promise<ProjectWithRelations[]> {
  return unstable_cache(
    () =>
      prisma.project.findMany({
        where: { published: true },
        orderBy: [{ featured: 'desc' }, { order: 'asc' }, { id: 'asc' }],
        include: projectInclude,
      }),
    [
      'published-projects',
      'media-mime-v2',
      'stack-array-v1',
      'project-type-text-v1',
      'legacy-gallery-compat-v4',
    ],
    {
      revalidate: 60,
      tags: ['projects'],
    }
  )();
}

export type ProjectSlugForSitemap = {
  slug: string;
  updatedAt: Date;
};

/**
 * Lightweight query (slug + updatedAt only, no relations/photos) used to enumerate
 * published detail pages for the sitemap.
 */
export async function getAllProjectSlugsForSitemap(): Promise<ProjectSlugForSitemap[]> {
  return prisma.project.findMany({
    where: detailPublished,
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  });
}
