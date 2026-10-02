import Link from 'next/link';
import { ADMIN_NAV_LINKS } from '@/app/(admin)/admin/constants';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-350">
        <h1 className="text-app-text mb-8 text-3xl font-semibold">Admin</h1>

        <div className="grid gap-4 sm:grid-cols-2">
          {ADMIN_NAV_LINKS.map(({ href, label, description, icon: Icon }) => (
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
          ))}
        </div>
      </div>
    </main>
  );
}
