import { http, HttpResponse } from 'msw';
import { storyOwnerMedia, storyMediaItems } from './admin-fixtures';

/** Local-only uploads shared by the media editor and content form demos. */
export const adminMediaHandlers = [
  http.get('/api/admin/media/cover-images', () =>
    HttpResponse.json({
      images: [{ ...storyOwnerMedia.coverAsset, id: 'previous-cover', label: 'pattern-photo.png' }],
    })
  ),
  http.get('/api/admin/:owner/:id/photos/upload-auth', () =>
    HttpResponse.json({
      token: 'story-token',
      signature: 'story-signature',
      expire: 9999999999,
      publicKey: 'story-public-key',
      folder: '/storybook',
    })
  ),
  http.post('https://upload.imagekit.io/api/v1/files/upload', async ({ request }) => {
    const form = await request.formData();
    return HttpResponse.json({ fileId: String(form.get('fileName')) });
  }),
  http.post('/api/admin/:owner/:id/photos/upload', async ({ request }) => {
    const { fileId } = (await request.json()) as { fileId: string };
    const video = fileId.endsWith('.webm');
    return HttpResponse.json({
      asset: {
        ...storyMediaItems[video ? 1 : 0].asset,
        id: crypto.randomUUID(),
      },
    });
  }),
];
