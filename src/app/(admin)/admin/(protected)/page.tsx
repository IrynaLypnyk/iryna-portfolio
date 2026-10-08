import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { routes } from '@/constants/routes';
import { ProjectStatus, ProjectType } from '@/generated/prisma/enums';
import messages from '@/messages/en.json';
import { ADMIN_NAV_LINKS } from '@/app/(admin)/admin/constants';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [projectGroups, experimentGroups, mediaCount, unusedMediaCount] = await Promise.all([
    prisma.project.groupBy({
      by: ['status', 'type', 'published', 'featured'],
      _count: { _all: true },
    }),
    prisma.experiment.groupBy({ by: ['published'], _count: { _all: true } }),
    prisma.mediaAsset.count(),
    prisma.mediaAsset.count({
      where: {
        defaultForPhotos: { none: {} },
        ukrainianForPhotos: { none: {} },
        experimentCovers: { none: {} },
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
      items: Object.values(ProjectType).map((type) => ({
        label: messages.ProjectMetadata.types[type],
        count: projectGroups.reduce(
          (sum, group) => sum + (group.type === type ? group._count._all : 0),
          0
        ),
      })),
    },
  ];

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-350">
        <h1 className="text-app-text mb-8 text-3xl font-semibold">Admin</h1>

        <dl className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map(({ label, value, detail, href }) => (
            <div key={label} className="border-app-line bg-app-surface rounded-xl border p-4">
              <dt className="text-app-muted text-sm">
                <Link href={href} className="hover:text-app-accent hover:underline">
                  {label}
                </Link>
              </dt>
              <dd className="text-app-text mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
              <dd className="text-app-muted mt-1 text-xs">{detail}</dd>
            </div>
          ))}
        </dl>

        <div className="mb-6 grid gap-3 lg:grid-cols-2">
          {breakdowns.map(({ title, items }) => (
            <section key={title} className="border-app-line bg-app-surface rounded-xl border p-4">
              <h2 className="text-app-text text-sm font-semibold">{title}</h2>
              <p className="text-app-muted mt-1 text-xs">All projects, including drafts</p>
              <dl className="mt-3 flex flex-wrap gap-2">
                {items.map(({ label, count }) => (
                  <div
                    key={label}
                    className="border-app-line flex items-center gap-2 rounded-md border px-2.5 py-1.5"
                  >
                    <dt className="text-app-muted text-xs">{label}</dt>
                    <dd className="text-app-text text-sm font-semibold tabular-nums">{count}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>

        <h2 className="text-app-text mb-4 text-xl font-semibold">Quick access</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {ADMIN_NAV_LINKS.filter(({ href }) => href !== routes.admin.root).map(
            ({ href, label, description, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group border-app-line bg-app-surface hover:border-app-line rounded-xl border p-6 transition hover:shadow-sm"
              >
                <div className="bg-app-accent-bright/10 text-app-accent-bright group-hover:bg-app-accent-lightest mb-4 flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
                  <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                </div>
                <h2 className="text-app-accent text-lg font-semibold">{label}</h2>
                <p className="text-app-muted mt-2 text-sm">{description}</p>
              </Link>
            )
          )}
        </div>
      </div>
    </main>
  );
}
