import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { routes } from '@/constants/routes';
import { getImageUrl } from '@/lib/imagekit/get-image-url';
import { ExperimentForm } from '../_components/ExperimentForm';
import { PhotoManager } from '../../projects/[id]/PhotoManager';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditExperimentPage({ params }: Props) {
  const { id } = await params;

  const experiment = await prisma.experiment.findUnique({
    where: { id },
    include: {
      photos: {
        orderBy: [{ orderInProject: 'asc' }, { createdAt: 'asc' }],
        include: { asset: true },
      },
    },
  });

  if (!experiment) {
    notFound();
  }

  const { photos, ...experimentFields } = experiment;
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
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <Link
            href={routes.admin.experiments}
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            ← All experiments
          </Link>

          <h1 className="mt-3 mb-8 text-3xl font-semibold text-neutral-900">
            {experimentFields.titleEn}
          </h1>
        </div>

        <ExperimentForm mode="edit" experiment={experimentFields} />

        <h2 className="text-xl font-semibold text-neutral-900">Photos & videos</h2>
        <PhotoManager
          ownerType="experiments"
          projectId={experimentFields.id}
          projectSlug={experimentFields.slug}
          photos={photoRows}
        />
      </div>
    </main>
  );
}
