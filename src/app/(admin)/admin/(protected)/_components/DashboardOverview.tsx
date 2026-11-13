import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { ADMIN_NAV_LINKS } from '@/app/(admin)/admin/constants';
import { routes } from '@/constants/routes';

type Props = {
  stats: { label: string; value: number; detail: string; href: string }[];
  breakdowns: { title: string; items: { label: string; count: number }[] }[];
};

const barColors = ['bg-app-accent', 'bg-app-violet', 'bg-app-accent-light', 'bg-app-yellow'];

export function DashboardOverview({ stats, breakdowns }: Props) {
  return (
    <main className="px-4 py-5 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-350 space-y-5 sm:space-y-6">
        <div>
          <p className="text-app-accent mb-1 text-xs font-semibold tracking-[0.18em] uppercase">
            Your workspace
          </p>
          <h1 className="text-app-ink text-2xl font-semibold tracking-tight sm:text-3xl">
            Dashboard
          </h1>
          <p className="text-app-muted mt-1 text-sm">Your portfolio content at a glance.</p>
        </div>

        <section
          aria-label="Content overview"
          className="border-app-line-blue bg-app-accent-lightest overflow-hidden rounded-2xl border"
        >
          <dl className="bg-app-line-blue grid grid-cols-2 gap-px lg:grid-cols-4">
            {stats.map(({ label, value, detail, href }, index) => (
              <div
                key={label}
                className={`min-w-0 px-4 py-3 sm:px-5 sm:py-4 ${index === 1 ? 'bg-app-violet-light' : 'bg-app-accent-lightest'}`}
              >
                <dt className="min-h-10 lg:min-h-5">
                  <Link
                    href={href}
                    className="group text-app-muted hover:text-app-accent focus-visible:outline-app-accent inline-flex items-center gap-2 rounded-sm text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
                  >
                    {label}
                    <ArrowUpRight
                      size={14}
                      aria-hidden="true"
                      className="shrink-0 opacity-50 transition-opacity group-hover:opacity-100"
                    />
                  </Link>
                </dt>
                <dd
                  className={`mt-2 text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl ${index === 1 ? 'text-app-accent' : 'text-app-ink'}`}
                >
                  {value}
                </dd>
                <dd className="text-app-muted mt-1 text-xs leading-relaxed">{detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          {breakdowns.map(({ title, items }) => {
            const total = items.reduce((sum, item) => sum + item.count, 0);

            return (
              <section key={title} className="border-app-line rounded-2xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-app-ink text-base font-semibold">{title}</h2>
                    <p className="text-app-muted mt-1 text-xs">All projects, including drafts</p>
                  </div>
                  <span className="text-app-muted text-xs tabular-nums">{total} total</span>
                </div>
                <div
                  aria-hidden="true"
                  className="bg-app-line-soft mt-3 flex h-1.5 gap-1 overflow-hidden rounded-full"
                >
                  {items
                    .filter(({ count }) => count > 0)
                    .map(({ label, count }) => (
                      <span
                        key={label}
                        className={`${barColors[items.findIndex((item) => item.label === label) % barColors.length]} min-w-0 rounded-full`}
                        style={{ width: `${(count / total) * 100}%` }}
                      />
                    ))}
                </div>
                {items.length > 0 ? (
                  <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                    {items.map(({ label, count }, index) => (
                      <div key={label} className="flex items-center justify-between gap-3 text-sm">
                        <dt className="text-app-muted flex min-w-0 items-center gap-2">
                          <span
                            aria-hidden="true"
                            className={`${barColors[index % barColors.length]} h-2 w-2 shrink-0 rounded-full`}
                          />
                          <span className="break-words">{label}</span>
                        </dt>
                        <dd className="text-app-ink font-semibold tabular-nums">{count}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-app-muted mt-3 text-sm">
                    Your projects will appear here once added.
                  </p>
                )}
              </section>
            );
          })}
        </div>

        <section aria-labelledby="quick-access-heading">
          <div className="mb-3 flex items-center gap-2">
            <ArrowDownRight className="text-app-accent" size={20} aria-hidden="true" />
            <h2
              id="quick-access-heading"
              className="text-app-ink text-lg font-semibold tracking-tight"
            >
              Quick access
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {ADMIN_NAV_LINKS.filter(({ href }) => href !== routes.admin.root).map(
              ({ href, label, description, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="group border-app-line bg-app-surface hover:border-app-accent-light focus-visible:outline-app-accent flex items-start gap-3 rounded-2xl border p-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  <div className="contents">
                    <span className="bg-app-accent-lightest text-app-accent group-hover:bg-app-violet-light flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors">
                      <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-app-ink group-hover:text-app-accent text-base font-semibold transition-colors">
                      {label}
                    </h3>
                    <p className="text-app-muted mt-1 text-xs leading-relaxed">{description}</p>
                  </div>
                  <ArrowUpRight
                    size={18}
                    aria-hidden="true"
                    className="text-app-accent mt-1 shrink-0"
                  />
                </Link>
              )
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
