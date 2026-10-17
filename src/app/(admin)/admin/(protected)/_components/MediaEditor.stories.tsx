import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { http, HttpResponse } from 'msw';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { MediaEditor } from './MediaEditor';
import { useOwnerMediaDraft } from './useOwnerMediaDraft';
import {
  mediaSnapshot,
  ownerMediaInput,
  type OwnerMediaDraft,
} from '@/lib/media/owner-media-draft';
import { AdminButton } from '../../_components/AdminButton';

/** Isolated form integration, including a block that has never been saved. */
function Harness({
  ownerType,
  context,
}: {
  ownerType: 'projects' | 'experiments';
  context: 'additional' | 'block';
}) {
  const [generation, setGeneration] = useState(0);
  return (
    <DraftForm
      key={generation}
      ownerType={ownerType}
      context={context}
      onDiscard={() => setGeneration((value) => value + 1)}
    />
  );
}
function DraftForm({
  ownerType,
  context,
  onDiscard,
}: {
  ownerType: 'projects' | 'experiments';
  context: 'additional' | 'block';
  onDiscard: () => void;
}) {
  const initial: OwnerMediaDraft = {
    additionalMedia: [],
    contentBlocks:
      context === 'block'
        ? [
            {
              key: 'unsaved-block',
              titleEn: null,
              titleUk: null,
              bodyEn: null,
              bodyUk: null,
              photos: [],
            },
          ]
        : [],
  };
  const draft = useOwnerMediaDraft(initial);
  const [saved, setSaved] = useState('No form save yet');
  const items =
    context === 'block' ? draft.media.contentBlocks[0].photos : draft.media.additionalMedia;
  return (
    <form
      className="max-w-5xl space-y-4 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const photos = items.map((item, index) => ({
          id: item.id ?? `saved-photo-${index}`,
          contentBlockId: context === 'block' ? 'saved-block' : null,
        }));
        const result = {
          photos,
          contentBlocks: context === 'block' ? [{ id: 'saved-block', photos }] : [],
        };
        draft.markSaved(result, draft.media);
        setSaved(JSON.stringify(ownerMediaInput(draft.media), null, 2));
      }}
    >
      <p className="text-sm">
        Test form · {ownerType} ·{' '}
        {context === 'block' ? 'Unsaved ContentBlock' : 'Additional Media'}
      </p>
      <MediaEditor
        ownerId="story-owner"
        ownerType={ownerType}
        context={context}
        items={items}
        disabled={draft.isUploading}
        onUploadingChangeAction={draft.onUploadingChange}
        onChangeAction={(update) =>
          draft.setMedia((current) => {
            const currentItems =
              context === 'block' ? current.contentBlocks[0].photos : current.additionalMedia;
            const next = typeof update === 'function' ? update(currentItems) : update;
            return context === 'block'
              ? { ...current, contentBlocks: [{ ...current.contentBlocks[0], photos: next }] }
              : { ...current, additionalMedia: next };
          })
        }
      />
      <p role="status">
        {draft.isUploading
          ? 'Uploads in progress'
          : draft.isDirty
            ? 'Unsaved changes'
            : 'All changes saved'}
      </p>
      <AdminButton type="submit" disabled={draft.isUploading}>
        Save main form
      </AdminButton>{' '}
      <AdminButton variant="outline" disabled={draft.isUploading} onClickAction={onDiscard}>
        Discard draft
      </AdminButton>
      <pre data-testid="saved" className="overflow-auto text-xs">
        {saved}
      </pre>
      <output data-testid="draft" className="sr-only">
        {mediaSnapshot(draft.media)}
      </output>
    </form>
  );
}

const meta = {
  title: 'Admin/MediaEditor',
  component: Harness,
  args: { ownerType: 'projects', context: 'additional' },
  beforeEach({ msw }) {
    // Every remote upload request is intercepted. No real account or DB used.
    msw.use(
      http.get('/api/admin/:owner/:id/photos/upload-auth', () =>
        HttpResponse.json({
          token: 'test-token',
          signature: 'test-signature',
          expire: 9999999999,
          publicKey: 'test-public-key',
          folder: '/test',
        })
      ),
      http.post('https://upload.imagekit.io/api/v1/files/upload', async ({ request }) => {
        const form = await request.formData();
        const name = String(form.get('fileName'));
        return name.includes('fail')
          ? HttpResponse.json({ message: 'Simulated upload failure' }, { status: 500 })
          : HttpResponse.json({ fileId: name });
      }),
      http.post('/api/admin/:owner/:id/photos/upload', async ({ request }) => {
        const { fileId } = (await request.json()) as { fileId: string };
        return HttpResponse.json({
          asset: {
            id: fileId,
            imageUrl: fileId.endsWith('.webm')
              ? '/storybook/media-editor.webm'
              : '/storybook/logo.png',
            mimeType: fileId.endsWith('.webm') ? 'video/webm' : 'image/png',
            width: 160,
            height: 90,
          },
        });
      })
    );
  },
} satisfies Meta<typeof Harness>;
export default meta;
type Story = StoryObj<typeof meta>;

const exercise: Story['play'] = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  const input = canvas.getByLabelText('Upload photos / videos');
  await userEvent.upload(input, [
    new File(['image'], 'first.png', { type: 'image/png' }),
    new File(['video'], 'clip.webm', { type: 'video/webm' }),
  ]);
  await waitFor(() =>
    expect(canvas.getAllByText('New · not saved', { exact: false })).toHaveLength(2)
  );
  await expect(canvasElement.querySelector('video')).toHaveAttribute(
    'src',
    '/storybook/media-editor.webm'
  );
  await waitFor(() => expect(canvasElement.querySelector('video')?.videoWidth).toBeGreaterThan(0));
  await userEvent.click(canvas.getByRole('button', { name: 'Edit media 1' }));
  await userEvent.type(canvas.getByLabelText('Caption (EN)'), 'Caption');
  await userEvent.type(canvas.getByLabelText('Description (UK)'), 'Опис');
  await userEvent.type(canvas.getByLabelText('External link'), 'https://example.com');
  await userEvent.upload(
    canvas.getAllByLabelText('Upload Ukrainian')[0],
    new File(['uk'], 'uk.png', { type: 'image/png' })
  );
  await waitFor(() =>
    expect(canvas.getByRole('button', { name: 'Remove Ukrainian variant' })).toBeEnabled()
  );
  await userEvent.click(canvas.getByRole('button', { name: 'Done' }));
  await userEvent.click(canvas.getByRole('button', { name: 'Move media 1 down' }));
  await userEvent.click(canvas.getByRole('button', { name: 'Edit media 2' }));
  await expect(canvas.getByLabelText('Caption (EN)')).toHaveValue('Caption');
  await userEvent.click(canvas.getByRole('button', { name: 'Done' }));
  await expect(canvas.getByTestId('saved')).toHaveTextContent('No form save yet');
  await userEvent.click(canvas.getByRole('button', { name: 'Save main form' }));
  await expect(canvas.getByTestId('saved')).toHaveTextContent('uk.png');
  await expect(canvas.getByTestId('saved')).toHaveTextContent('Caption');
  await expect(canvas.getAllByText('Saved usage', { exact: false })).toHaveLength(2);
  await expect(canvas.getByText('All changes saved', { exact: true })).toBeInTheDocument();
  // A second save includes persisted IDs rather than inserting duplicates.
  await userEvent.click(canvas.getByRole('button', { name: 'Save main form' }));
  await expect(canvas.getByTestId('saved')).toHaveTextContent('saved-photo-0');
  await expect(canvas.getByTestId('saved')).toHaveTextContent('saved-photo-1');
  await userEvent.click(canvas.getByRole('button', { name: 'Edit media 2' }));
  await userEvent.click(canvas.getByRole('button', { name: 'Remove Ukrainian variant' }));
  await userEvent.click(canvas.getByRole('button', { name: 'Done' }));
  await expect(canvas.getByText('Unsaved changes', { exact: true })).toBeInTheDocument();
  await userEvent.click(canvas.getByRole('button', { name: 'Remove media 1' }));
  const dialog = within(canvasElement.ownerDocument.body).getByRole('dialog');
  await userEvent.click(within(dialog).getByRole('button', { name: /^Delete$/ }));
  await expect(canvas.getAllByText('Saved usage', { exact: false })).toHaveLength(1);
  await userEvent.click(canvas.getByRole('button', { name: 'Save main form' }));
  await expect(canvas.getByTestId('saved')).not.toHaveTextContent('clip.webm');
  await expect(canvas.getByTestId('saved')).not.toHaveTextContent('uk.png');
  await expect(canvas.getByTestId('saved')).toHaveTextContent('saved-photo-1');
  canvasElement.dataset.mediaTestResult = `${args.ownerType}-${args.context}`;
};
export const ProjectAdditionalMedia: Story = { play: exercise };
export const ProjectUnsavedBlock: Story = { args: { context: 'block' }, play: exercise };
export const ExperimentAdditionalMedia: Story = {
  args: { ownerType: 'experiments' },
  play: exercise,
};
export const ExperimentUnsavedBlock: Story = {
  args: { ownerType: 'experiments', context: 'block' },
  play: exercise,
};
export const FailedUploadsAndDiscard: Story = {
  args: { context: 'block' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.upload(canvas.getByLabelText('Upload photos / videos'), [
      new File(['bad'], 'fail.webm', { type: 'video/webm' }),
      new File(['ok'], 'ok.png', { type: 'image/png' }),
    ]);
    await waitFor(() =>
      expect(canvas.getByText('New · not saved', { exact: false })).toBeInTheDocument()
    );
    await expect(canvas.getByText(/Simulated upload failure/)).toBeInTheDocument();
    await expect(canvas.getByTestId('saved')).toHaveTextContent('No form save yet');
    await userEvent.click(canvas.getByRole('button', { name: 'Discard draft' }));
    await expect(canvas.queryByText('New · not saved', { exact: false })).not.toBeInTheDocument();
    await expect(canvas.getByTestId('saved')).toHaveTextContent('No form save yet');
    canvasElement.dataset.mediaTestResult = 'discard-passed';
  },
};
