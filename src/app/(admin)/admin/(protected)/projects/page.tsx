import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { routes } from '@/constants/routes';
import { AdminButton } from '@/app/(admin)/admin/_components/AdminButton';
import { ProjectDeleteButton } from './_components/ProjectDeleteButton';

export const dynamic = 'force-dynamic';

const headCellStyles = 'border-b border-neutral-200 bg-neutral-100 px-3 py-3 text-left';

export default async function AdminProjectsListPage() {
  const projects = await prisma.project.findMany({
    orderBy: [{ featured: 'desc' }, { order: 'asc' }],
    include: { _count: { select: { photos: true } } },
  });

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-350">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold text-neutral-900">Проєкти</h1>
          <AdminButton href={routes.admin.projectNew}>Новий проєкт</AdminButton>
        </div>

        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-200 border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th className={headCellStyles}>Назва</th>
                  <th className={`${headCellStyles} w-32`}>Мітка</th>
                  <th className={`${headCellStyles} w-24`}>Порядок</th>
                  <th className={`${headCellStyles} w-28`}>Фото</th>
                  <th className={`${headCellStyles} w-40`}>Стан</th>
                  <th className={`${headCellStyles} w-44`}>Дії</th>
                </tr>
              </thead>

              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-t border-neutral-200 align-middle">
                    <td className="px-3 py-3">
                      <Link
                        href={routes.admin.project(project.id)}
                        className="font-medium text-neutral-900 hover:underline"
                      >
                        {project.titleEn}
                      </Link>
                      <p className="mt-0.5 font-mono text-xs text-neutral-500">{project.slug}</p>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-neutral-600">
                      {project.shortLabel}
                    </td>
                    <td className="px-3 py-3 text-neutral-600">{project.order}</td>
                    <td className="px-3 py-3 text-neutral-600">{project._count.photos}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1.5 text-xs">
                        {project.featured && (
                          <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-white">
                            Вибране
                          </span>
                        )}
                        <span
                          className={
                            project.published
                              ? 'rounded-full bg-green-100 px-2 py-0.5 text-green-800'
                              : 'rounded-full bg-neutral-200 px-2 py-0.5 text-neutral-600'
                          }
                        >
                          {project.published ? 'Опубліковано' : 'Чернетка'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <AdminButton
                          variant="outline"
                          size="sm"
                          href={routes.admin.project(project.id)}
                        >
                          Редагувати
                        </AdminButton>
                        <ProjectDeleteButton id={project.id} title={project.titleEn} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {projects.length === 0 && (
            <div className="p-10 text-center text-sm text-neutral-500">Поки що немає проєктів.</div>
          )}
        </div>
      </div>
    </main>
  );
}
