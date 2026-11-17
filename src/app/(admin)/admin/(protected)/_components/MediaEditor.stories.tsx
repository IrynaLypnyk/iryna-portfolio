import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { http, HttpResponse } from 'msw';
import { MediaEditor } from './MediaEditor';
import type { MediaDraft } from '@/lib/media/media-draft';
import { storyMediaItems } from '@/storybook/admin-fixtures';
import { adminMediaHandlers } from '@/storybook/admin-media-mocks';

function MediaEditorDemo({
  ownerType,
  context,
  items: initialItems = storyMediaItems,
}: {
  ownerType: 'projects' | 'experiments';
  context: 'additional' | 'block';
  items?: MediaDraft[];
}) {
  const [items, setItems] = useState(initialItems);
  const [uploads, setUploads] = useState(0);
  return (
    <div className="max-w-5xl p-5">
      <MediaEditor
        ownerId="story-owner"
        ownerType={ownerType}
        context={context}
        items={items}
        disabled={uploads > 0}
        onChangeAction={setItems}
        onUploadingChangeAction={(busy) =>
          setUploads((count) => Math.max(0, count + (busy ? 1 : -1)))
        }
      />
    </div>
  );
}

const meta = {
  title: 'Admin/MediaEditor',
  component: MediaEditorDemo,
  args: { ownerType: 'projects', context: 'additional' },
  beforeEach({ msw }) {
    msw.use(...adminMediaHandlers);
  },
} satisfies Meta<typeof MediaEditorDemo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ProjectAdditionalMedia: Story = {};
export const ProjectUnsavedBlock: Story = {
  args: { context: 'block', items: storyMediaItems.map(({ id: _id, ...item }) => item) },
};
export const ExperimentAdditionalMedia: Story = { args: { ownerType: 'experiments' } };
export const ExperimentUnsavedBlock: Story = {
  args: {
    ownerType: 'experiments',
    context: 'block',
    items: storyMediaItems.map(({ id: _id, ...item }) => item),
  },
};
export const Empty: Story = { args: { items: [] } };
/** Upload any file to see the error state; no request reaches ImageKit. */
export const UploadError: Story = {
  args: { items: [] },
  beforeEach({ msw }) {
    msw.use(
      http.post('https://upload.imagekit.io/api/v1/files/upload', () =>
        HttpResponse.json({ message: 'Simulated upload failure' }, { status: 500 })
      )
    );
  },
};
