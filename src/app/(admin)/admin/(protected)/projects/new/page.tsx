import Link from 'next/link';
import { routes } from '@/constants/routes';
import { ProjectForm } from '../_components/ProjectForm';

export const dynamic = 'force-dynamic';

export default async function NewProjectPage() {
  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href={routes.admin.projects}
          className="text-app-accent-bright hover:text-app-text text-base"
        >
          ← All projects
        </Link>

        <h1 className="mt-3 mb-8 text-3xl font-semibold text-neutral-900">New project</h1>

        <ProjectForm mode="create" />
      </div>
    </main>
  );
}
