import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma/client';
import { unstable_cache } from 'next/cache';

const projectInclude = {
  photos: {
    orderBy: [{ orderInProject: 'asc' }, { createdAt: 'asc' }],
    include: { asset: true },
  },
  sections: {
    orderBy: { order: 'asc' },
  },
} satisfies Prisma.ProjectInclude;

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
    ['published-projects'],
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
 * published projects for the sitemap and for `generateStaticParams`.
 */
export async function getAllProjectSlugsForSitemap(): Promise<ProjectSlugForSitemap[]> {
  return await unstable_cache(
    () =>
      prisma.project.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
    ['project-slugs-for-sitemap'],
    {
      revalidate: 3600,
      tags: ['projects'],
    }
  )();
}
