import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { routes } from '@/constants/routes';
import { getImageUrl } from '@/lib/imagekit/get-image-url';
import { ProjectForm } from '../_components/ProjectForm';
import { PhotoManager } from './PhotoManager';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      photos: {
        orderBy: [{ orderInProject: 'asc' }, { createdAt: 'asc' }],
        include: { asset: true },
      },
      sections: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const { photos, ...projectFields } = project;

  const photoRows = photos.map((photo) => ({
    id: photo.id,
    imageUrl: getImageUrl(photo.asset.src),
    mimeType: photo.asset.mimeType,
    width: photo.asset.width,
    height: photo.asset.height,
    orderInProject: photo.orderInProject,
    isProjectCover: photo.isProjectCover,
    captionUk: photo.captionUk,
    captionEn: photo.captionEn,
    linkUrl: photo.linkUrl,
    descriptionUk: photo.descriptionUk,
    descriptionEn: photo.descriptionEn,
  }));

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href={routes.admin.projects}
          className="text-sm text-neutral-500 hover:text-neutral-900"
        >
          ← All projects
        </Link>

        <h1 className="mt-3 mb-8 text-3xl font-semibold text-neutral-900">
          {projectFields.titleEn}
        </h1>

        <ProjectForm mode="edit" project={projectFields} />

        <h2 className="mt-12 mb-4 text-xl font-semibold text-neutral-900">Photos & videos</h2>

        <PhotoManager
          projectId={projectFields.id}
          projectSlug={projectFields.slug}
          photos={photoRows}
        />
      </div>
    </main>
  );
}
