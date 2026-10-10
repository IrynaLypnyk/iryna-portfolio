import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { routes } from '@/constants/routes';
import { AdminButton } from '@/app/(admin)/admin/_components/AdminButton';
import { EditButton } from '@/app/(admin)/admin/_components/EditButton';
import { ExperimentDeleteButton } from './_components/ExperimentDeleteButton';
import { AdminTag } from '@/app/(admin)/admin/(protected)/_components/AdminTag';

export const dynamic = 'force-dynamic';

const headCellStyles = 'border-b border-neutral-200 bg-neutral-100 px-3 py-3 text-left';

export default async function AdminExperimentsListPage() {
  const experiments = await prisma.experiment.findMany({
    orderBy: [{ order: 'asc' }],
  });

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-350">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-neutral-900">Playground</h1>
          <AdminButton href={routes.admin.experimentNew}>New experiment</AdminButton>
        </div>

        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-200 border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className={headCellStyles}>Name</th>
                  <th className={`${headCellStyles} w-24`}>Order</th>
                  <th className={`${headCellStyles} w-40`}>Status</th>
                  <th className={`${headCellStyles} w-44`}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {experiments.map((experiment) => (
                  <tr key={experiment.id} className="border-t border-neutral-200 align-middle">
                    <td className="px-3 py-3">
                      <Link
                        href={routes.admin.experiment(experiment.id)}
                        className="font-medium text-neutral-900 hover:underline"
                      >
                        {experiment.titleEn}
                      </Link>
                      <p className="text-app-muted mt-0.5 font-mono text-xs">{experiment.slug}</p>
                    </td>
                    <td className="text-app-muted px-3 py-3">{experiment.order}</td>
                    <td className="px-3 py-3">
                      <AdminTag color={experiment.published ? 'success' : 'warning'}>
                        {experiment.published ? 'Published' : 'Draft'}
                      </AdminTag>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <EditButton href={routes.admin.experiment(experiment.id)} />
                        <ExperimentDeleteButton id={experiment.id} title={experiment.titleEn} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {experiments.length === 0 && (
            <div className="p-10 text-center text-sm text-neutral-500">No experiments yet.</div>
          )}
        </div>
      </div>
    </main>
  );
}
