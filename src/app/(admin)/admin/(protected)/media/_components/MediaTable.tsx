import Link from 'next/link';

import { routes } from '@/constants/routes';
import { AdminMediaPreview } from '@/app/(admin)/admin/(protected)/_components/AdminMediaPreview';
import { AdminTag } from '@/app/(admin)/admin/(protected)/_components/AdminTag';

export type MediaLibraryItem = {
  id: string;
  imageKitFileId: string;
  src: string;
  mimeType?: string | null;
  previewUrl: string;
  width: number;
  height: number;
  createdAt: Date;

  usageCount: number;

  projects: {
    id: string;
    slug: string;
    title: string;
  }[];
};

type MediaTableProps = {
  items: MediaLibraryItem[];
};

const dateFormatter = new Intl.DateTimeFormat('uk-UA', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export function MediaTable({ items }: MediaTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead className="bg-neutral-100 text-left">
          <tr>
            <th className="w-28 px-4 py-3">Preview</th>
            <th className="px-4 py-3">File</th>
            <th className="w-94 px-4 py-3">Projects</th>
            <th className="w-36 px-4 py-3">Uploaded</th>
            <th className="w-44 px-4 py-3">Статус</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-neutral-200 align-middle">
              <td className="px-4 py-3">
                <AdminMediaPreview
                  src={item.previewUrl}
                  mimeType={item.mimeType}
                  className="h-16 w-20"
                  sizes="80px"
                />
              </td>

              <td className="px-4 py-3">
                <p
                  className="max-w-96 font-mono text-[11px] leading-4 break-all text-neutral-600"
                  title={item.src}
                >
                  {item.src}
                </p>

                <p className="mt-1 text-xs text-neutral-500">
                  {item.width} × {item.height}
                </p>
              </td>

              <td className="px-4 py-3">
                {item.projects.length > 0 ? (
                  <div className="space-y-1">
                    {item.projects.map((project) => (
                      <Link
                        key={project.id}
                        href={routes.admin.project(project.id)}
                        className="block max-w-56 truncate text-neutral-900 underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-900"
                      >
                        {project.title}
                      </Link>
                    ))}

                    {item.usageCount > item.projects.length && (
                      <p className="text-xs text-neutral-500">
                        {item.usageCount} використань у фото
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-neutral-400">—</span>
                )}
              </td>

              <td className="px-4 py-3 text-neutral-600">{dateFormatter.format(item.createdAt)}</td>

              <td className="px-4 py-3">
                {item.usageCount > 0 ? (
                  <AdminTag color="warning">Used in · {item.usageCount}</AdminTag>
                ) : (
                  <AdminTag color="info">Not used</AdminTag>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {items.length === 0 && (
        <div className="p-10 text-center text-sm text-neutral-500">
          Немає медіафайлів для цього фільтра.
        </div>
      )}
    </div>
  );
}
