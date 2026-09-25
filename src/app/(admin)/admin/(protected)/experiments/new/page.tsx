import Link from 'next/link';
import { routes } from '@/constants/routes';
import { ExperimentForm } from '../_components/ExperimentForm';

export const dynamic = 'force-dynamic';

export default async function NewExperimentPage() {
  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href={routes.admin.experiments}
          className="text-sm text-neutral-500 hover:text-neutral-900"
        >
          ← Усі експерименти
        </Link>

        <h1 className="mt-3 mb-8 text-3xl font-semibold text-neutral-900">Новий експеримент</h1>

        <ExperimentForm mode="create" />
      </div>
    </main>
  );
}
