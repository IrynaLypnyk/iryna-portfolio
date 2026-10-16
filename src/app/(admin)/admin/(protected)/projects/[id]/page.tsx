import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { routes } from '@/constants/routes';
import { adminMediaDraft } from '@/lib/media/admin-media';
import { ProjectForm } from '../_components/ProjectForm';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      contentBlocks: {
        orderBy: [{ order: 'asc' }, { id: 'asc' }],
        include: {
          photos: {
            orderBy: [{ orderInProject: 'asc' }, { id: 'asc' }],
            include: { asset: true, assetUk: true },
          },
        },
      },
      photos: {
        where: { contentBlockId: null },
        orderBy: [{ orderInProject: 'asc' }, { createdAt: 'asc' }],
        include: { asset: true, assetUk: true },
      },
      sections: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const initialMedia = adminMediaDraft(project);
  const { photos: _photos, contentBlocks: _blocks, ...projectFields } = project;

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href={routes.admin.projects}
          className="text-app-accent-bright hover:text-app-text text-base"
        >
          ← All projects
        </Link>

        <h1 className="mt-3 mb-8 text-3xl font-semibold text-neutral-900">
          {projectFields.titleEn}
        </h1>

        <ProjectForm mode="edit" project={projectFields} initialMedia={initialMedia} />
      </div>
    </main>
  );
}
