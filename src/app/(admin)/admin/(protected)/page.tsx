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
        <h1 className="text-app-text mb-8 text-3xl font-semibold">Admin</h1>

        <div className="grid gap-4 sm:grid-cols-2">
          {SECTIONS.map(({ href, title, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group border-app-line bg-app-surface hover:border-app-line rounded-xl border p-6 transition hover:shadow-sm"
            >
              <div className="bg-app-accent-lightest text-app-accent group-hover:bg-app-accent-lightest mb-4 flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
                <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
              </div>
              <h2 className="text-app-accent text-lg font-semibold">{title}</h2>
              <p className="text-app-muted mt-2 text-sm">{description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
