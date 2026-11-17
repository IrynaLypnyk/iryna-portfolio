import { http, HttpResponse, type HttpResponseResolver } from 'msw';
import type { ownerMediaInput } from '@/lib/media/owner-media-draft';
import { storyProject, storyExperiment } from './admin-fixtures';

const saveContent: HttpResponseResolver = async ({ request, params }) => {
  const body = (await request.json()) as ReturnType<typeof ownerMediaInput>;
  const contentBlocks = body.contentBlocks.map((block) => ({
    ...block,
    id: block.id ?? crypto.randomUUID(),
    photos: block.photos.map((photo) => ({ ...photo, id: photo.id ?? crypto.randomUUID() })),
  }));
  const photos = [
    ...body.additionalMedia.map((photo) => ({
      ...photo,
      id: photo.id ?? crypto.randomUUID(),
      contentBlockId: null,
    })),
    ...contentBlocks.flatMap((block) =>
      block.photos.map((photo) => ({ ...photo, contentBlockId: block.id }))
    ),
  ];
  const kind = params.owner === 'projects' ? 'project' : 'experiment';
  return HttpResponse.json({
    [kind]: {
      ...(kind === 'project' ? storyProject : storyExperiment),
      ...body,
      contentBlocks,
      photos,
    },
    cleanup: { failedAssetIds: [], deletedAssetIds: [] },
  });
};

export const adminContentHandlers = [
  http.patch('/api/admin/:owner/:id', saveContent),
  http.post('/api/admin/:owner', saveContent),
];
