import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { routes } from '@/constants/routes';
import { getImageUrl } from '@/lib/imagekit/get-image-url';
import { ExperimentForm } from '../_components/ExperimentForm';
import { ExperimentCoverSection } from '../_components/ExperimentCoverSection';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditExperimentPage({ params }: Props) {
  const { id } = await params;

  const experiment = await prisma.experiment.findUnique({
    where: { id },
    include: { coverAsset: true },
  });

  if (!experiment) {
    notFound();
  }

  const { coverAsset, ...experimentFields } = experiment;

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
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

        <ExperimentCoverSection
          experimentId={experimentFields.id}
          initialCover={
            coverAsset
              ? {
                  id: coverAsset.id,
                  imageUrl: getImageUrl(coverAsset.src),
                  width: coverAsset.width,
                  height: coverAsset.height,
                }
              : null
          }
        />
      </div>
    </main>
  );
}
