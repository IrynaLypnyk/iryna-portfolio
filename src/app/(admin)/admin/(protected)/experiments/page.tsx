import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { routes } from '@/constants/routes';
import { AdminButton } from '@/app/(admin)/admin/_components/AdminButton';
import { ExperimentDeleteButton } from './_components/ExperimentDeleteButton';

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
          <AdminButton href={routes.admin.experimentNew}>Новий експеримент</AdminButton>
        </div>

        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-200 border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className={headCellStyles}>Назва</th>
                  <th className={`${headCellStyles} w-24`}>Порядок</th>
                  <th className={`${headCellStyles} w-40`}>Стан</th>
                  <th className={`${headCellStyles} w-44`}>Дії</th>
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
                      <p className="mt-0.5 font-mono text-xs text-neutral-500">{experiment.slug}</p>
                    </td>
                    <td className="px-3 py-3 text-neutral-600">{experiment.order}</td>
                    <td className="px-3 py-3">
                      <span
                        className={
                          experiment.published
                            ? 'rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800'
                            : 'rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-600'
                        }
                      >
                        {experiment.published ? 'Опубліковано' : 'Чернетка'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <AdminButton
                          variant="outline"
                          size="sm"
                          href={routes.admin.experiment(experiment.id)}
                        >
                          Редагувати
                        </AdminButton>
                        <ExperimentDeleteButton id={experiment.id} title={experiment.titleEn} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {experiments.length === 0 && (
            <div className="p-10 text-center text-sm text-neutral-500">
              Поки що немає експериментів.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
