import { prisma } from '@/lib/prisma';
import { routes } from '@/constants/routes';
import { ProjectStatus } from '@/generated/prisma/enums';
import messages from '@/messages/en.json';
import { DashboardOverview } from './_components/DashboardOverview';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [projectGroups, experimentGroups, mediaCount, unusedMediaCount] = await Promise.all([
    prisma.project.groupBy({
      by: ['status', 'projectTypeEn', 'published', 'featured'],
      _count: { _all: true },
    }),
    prisma.experiment.groupBy({ by: ['published'], _count: { _all: true } }),
    prisma.mediaAsset.count(),
    prisma.mediaAsset.count({
      where: {
        defaultForPhotos: { none: {} },
        ukrainianForPhotos: { none: {} },
      },
    }),
  ]);

  const projectCount = projectGroups.reduce((sum, group) => sum + group._count._all, 0);
  const publishedCount = projectGroups.reduce(
    (sum, group) => sum + (group.published ? group._count._all : 0),
    0
  );
  const featuredCount = projectGroups.reduce(
    (sum, group) => sum + (group.published && group.featured ? group._count._all : 0),
    0
  );
  const experimentCount = experimentGroups.reduce((sum, group) => sum + group._count._all, 0);
  const publishedExperimentCount =
    experimentGroups.find((group) => group.published)?._count._all ?? 0;

  const stats = [
    {
      label: 'Projects',
      value: projectCount,
      detail: `${projectCount - publishedCount} drafts`,
      href: routes.admin.projects,
    },
    {
      label: 'Published projects',
      value: publishedCount,
      detail: `${featuredCount} featured`,
      href: routes.admin.projects,
    },
    {
      label: 'Experiments',
      value: experimentCount,
      detail: `${publishedExperimentCount} published · ${experimentCount - publishedExperimentCount} drafts`,
      href: routes.admin.experiments,
    },
    {
      label: 'Media files',
      value: mediaCount,
      detail: `${unusedMediaCount} unused`,
      href: routes.admin.media,
    },
  ];

  const breakdowns = [
    {
      title: 'Projects by status',
      items: Object.values(ProjectStatus).map((status) => ({
        label: messages.ProjectMetadata.statuses[status],
        count: projectGroups.reduce(
          (sum, group) => sum + (group.status === status ? group._count._all : 0),
          0
        ),
      })),
    },
    {
      title: 'Projects by type',
      items: Array.from(new Set(projectGroups.map((group) => group.projectTypeEn))).map((type) => ({
        label: type ?? 'Not specified',
        count: projectGroups.reduce(
          (sum, group) => sum + (group.projectTypeEn === type ? group._count._all : 0),
          0
        ),
      })),
    },
  ];

  return <DashboardOverview stats={stats} breakdowns={breakdowns} />;
}
