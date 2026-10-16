import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { routes } from '@/constants/routes';
import { adminMediaDraft } from '@/lib/media/admin-media';
import { ExperimentForm } from '../_components/ExperimentForm';
import { AppLink } from '@/app/(site)/[locale]/_components/_ui/AppLink';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditExperimentPage({ params }: Props) {
  const { id } = await params;

  const experiment = await prisma.experiment.findUnique({
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
    },
  });

  if (!experiment) {
    notFound();
  }

  const initialMedia = adminMediaDraft(experiment);
  const { photos: _photos, contentBlocks: _blocks, ...experimentFields } = experiment;

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <AppLink
            href={routes.admin.experiments}
            color="blueBright"
            arrowPosition="before"
            arrow="left"
          >
            All experiments
          </AppLink>

          <h1 className="mt-3 mb-8 text-3xl font-semibold text-neutral-900">
            {experimentFields.titleEn}
          </h1>
        </div>

        <ExperimentForm mode="edit" experiment={experimentFields} initialMedia={initialMedia} />
      </div>
    </main>
  );
}
