import Link from 'next/link';
import { FolderKanban, Images } from 'lucide-react';
import { routes } from '@/constants/routes';

export const dynamic = 'force-dynamic';

const SECTIONS = [
  {
    href: routes.admin.projects,
    title: 'Проєкти',
    description: 'Case studies shown on the home page, their order and their photos.',
    icon: FolderKanban,
  },
  {
    href: routes.admin.media,
    title: 'Медіа',
    description: 'Every uploaded image asset.',
    icon: Images,
  },
] as const;

export default async function AdminDashboard() {
  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-350">
        <h1 className="mb-8 text-3xl font-semibold text-neutral-900">Admin</h1>

        <div className="grid gap-4 sm:grid-cols-2">
          {SECTIONS.map(({ href, title, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-xl border border-neutral-200 bg-white p-6 transition hover:border-neutral-400 hover:shadow-sm"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800 transition-colors group-hover:bg-neutral-200">
                <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
              </div>
              <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
              <p className="mt-2 text-sm text-neutral-600">{description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
