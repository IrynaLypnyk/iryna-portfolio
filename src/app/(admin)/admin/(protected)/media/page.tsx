import { prisma } from '@/lib/prisma';
import { routes } from '@/constants/routes';
import { AdminFilterChip } from '@/app/(admin)/admin/(protected)/_components/AdminFilterChip';
import { getImageUrl } from '@/lib/imagekit/get-image-url';

import { MediaTable, type MediaLibraryItem } from './_components/MediaTable';

export const dynamic = 'force-dynamic';

type UsageFilter = 'all' | 'used' | 'unused';

type AdminMediaPageProps = {
  searchParams: Promise<{
    usage?: string | string[];
  }>;
};

function getUsageFilter(value: string | string[] | undefined): UsageFilter {
  const usage = Array.isArray(value) ? value[0] : value;

  if (usage === 'used' || usage === 'unused') {
    return usage;
  }

  return 'all';
}

function getUniqueProjects(
  projectPhotos: {
    project: {
      id: string;
      slug: string;
      titleUk: string;
    };
  }[]
) {
  return Array.from(
    new Map(
      projectPhotos.map(({ project }) => [
        project.id,
        {
          id: project.id,
          slug: project.slug,
          title: project.titleUk,
        },
      ])
    ).values()
  );
}

export default async function AdminMediaPage({ searchParams }: AdminMediaPageProps) {
  const params = await searchParams;
  const usageFilter = getUsageFilter(params.usage);

  const assets = await prisma.mediaAsset.findMany({
    select: {
      id: true,
      imageKitFileId: true,
      src: true,
      width: true,
      height: true,
      createdAt: true,

      defaultForPhotos: {
        select: {
          project: {
            select: {
              id: true,
              slug: true,
              titleUk: true,
            },
          },
        },
      },

      ukrainianForPhotos: {
        select: {
          project: {
            select: {
              id: true,
              slug: true,
              titleUk: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const mediaItems: MediaLibraryItem[] = assets.map((asset) => {
    const allPhotoUsages = [...asset.defaultForPhotos, ...asset.ukrainianForPhotos];

    const usageCount = allPhotoUsages.length;

    return {
      id: asset.id,
      imageKitFileId: asset.imageKitFileId,
      src: asset.src,
      previewUrl: getImageUrl(asset.src),
      width: asset.width,
      height: asset.height,
      createdAt: asset.createdAt,

      usageCount,

      projects: getUniqueProjects(allPhotoUsages),
    };
  });

  const usedCount = mediaItems.filter((item) => item.usageCount > 0).length;
  const unusedCount = mediaItems.length - usedCount;

  const filteredItems = mediaItems.filter((item) => {
    if (usageFilter === 'used') {
      return item.usageCount > 0;
    }

    if (usageFilter === 'unused') {
      return item.usageCount === 0;
    }

    return true;
  });

  const tabs: {
    value: UsageFilter;
    label: string;
    count: number;
    href: string;
  }[] = [
    {
      value: 'all',
      label: 'Усі',
      count: mediaItems.length,
      href: routes.admin.media,
    },
    {
      value: 'used',
      label: 'Used',
      count: usedCount,
      href: `${routes.admin.media}?usage=used`,
    },
    {
      value: 'unused',
      label: 'Не використовуються',
      count: unusedCount,
      href: `${routes.admin.media}?usage=unused`,
    },
  ];

  return (
    <main className="px-6 py-10 text-neutral-900">
      <div className="mx-auto max-w-325">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">Медіафайли</h1>
          <p className="mt-2 text-sm text-neutral-600">{mediaItems.length} файлів</p>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const isActive = tab.value === usageFilter;

            return (
              <AdminFilterChip key={tab.value} href={tab.href} active={isActive}>
                {tab.label}&nbsp;{tab.count}
              </AdminFilterChip>
            );
          })}
        </div>

        <MediaTable items={filteredItems} />
      </div>
    </main>
  );
}
