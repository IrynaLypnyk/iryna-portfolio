import type { Meta, StoryObj } from '@storybook/nextjs';
import { delay, http, HttpResponse } from 'msw';
import { expect, userEvent, within, waitFor, spyOn } from 'storybook/test';
import { ProjectForm, type ProjectWithSections } from '../projects/_components/ProjectForm';
import { ExperimentForm } from '../experiments/_components/ExperimentForm';
import type { Experiment as DbExperiment } from '@/generated/prisma/browser';
import { UnsavedChangesProvider } from './UnsavedChangesProvider';
import type { OwnerMediaDraft, ownerMediaInput } from '@/lib/media/owner-media-draft';

const now = new Date('2026-10-16T12:00:00Z');
const project: ProjectWithSections = {
  id: 'story-owner',
  slug: 'story-project',
  titleEn: 'Project title',
  titleUk: 'Назва',
  status: 'COMPLETED',
  shortLabel: null,
  subtitleEn: null,
  subtitleUk: null,
  contextEn: null,
  contextUk: null,
  leadEn: null,
  leadUk: null,
  roleEn: null,
  roleUk: null,
  projectTypeEn: null,
  projectTypeUk: null,
  statusEn: null,
  statusUk: null,
  yearLabel: null,
  externalUrl: null,
  linkLabelEn: null,
  linkLabelUk: null,
  linkNoteEn: null,
  linkNoteUk: null,
  featuresTitleEn: null,
  featuresTitleUk: null,
  githubUrl: null,
  storybookUrl: null,
  stack: [],
  featuresEn: [],
  featuresUk: [],
  order: 0,
  published: true,
  featured: false,
  detailPageStatus: 'NONE',
  coverAssetId: 'existing-cover',
  coverAssetUkId: 'existing-uk',
  createdAt: now,
  updatedAt: now,
  sections: [
    {
      id: 'legacy-section',
      projectId: 'story-owner',
      order: 1,
      titleEn: 'Legacy',
      titleUk: 'Стара секція',
      bodyEn: 'Keep legacy content',
      bodyUk: 'Зберегти',
      body2En: null,
      body2Uk: null,
      createdAt: now,
      updatedAt: now,
    },
  ],
};
const experiment: DbExperiment = {
  id: 'story-owner',
  slug: 'story-experiment',
  titleEn: 'Experiment title',
  titleUk: 'Назва',
  descriptionEn: 'Description',
  descriptionUk: 'Опис',
  shortDescriptionEn: '',
  shortDescriptionUk: '',
  stack: null,
  demoUrl: null,
  githubUrl: null,
  order: 0,
  published: true,
  detailPageStatus: 'NONE',
  coverAssetId: 'existing-cover',
  coverAssetUkId: 'existing-uk',
  createdAt: now,
  updatedAt: now,
};
const initial: OwnerMediaDraft = {
  additionalMedia: [],
  contentBlocks: [],
  coverAsset: {
    id: 'existing-cover',
    imageUrl: '/storybook/logo.png',
    mimeType: 'image/png',
    width: 160,
    height: 90,
  },
  coverAssetUk: {
    id: 'existing-uk',
    imageUrl: '/storybook/logo.png',
    mimeType: 'image/png',
    width: 160,
    height: 90,
  },
};
type Submission = ReturnType<typeof ownerMediaInput> & {
  titleEn: string;
  detailPageStatus: string;
  sections?: unknown;
};
let submissions: Submission[] = [];
let sequence = 0;

function Forms({
  ownerType,
  create = false,
}: {
  ownerType: 'projects' | 'experiments';
  create?: boolean;
}) {
  return (
    <UnsavedChangesProvider>
      <header
        data-component="Header"
        className="sticky top-0 z-20 flex h-[65px] items-center border-b border-neutral-200 bg-white px-6 font-medium"
      >
        Admin
      </header>
      <main className="px-6 py-10">
        <div className="mx-auto max-w-5xl">
          {ownerType === 'projects' ? (
            create ? (
              <ProjectForm mode="create" />
            ) : (
              <ProjectForm mode="edit" project={project} initialMedia={initial} />
            )
          ) : create ? (
            <ExperimentForm mode="create" />
          ) : (
            <ExperimentForm mode="edit" experiment={experiment} initialMedia={initial} />
          )}
        </div>
      </main>
    </UnsavedChangesProvider>
  );
}
const meta = {
  title: 'Admin/ContentForms',
  component: Forms,
  args: { ownerType: 'projects', create: false },
  beforeEach({ msw }) {
    submissions = [];
    sequence = 0;
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
        return HttpResponse.json({ fileId: String(form.get('fileName')) });
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
      }),
      http.patch('/api/admin/:owner/:id', async ({ request, params }) => {
        const body = (await request.json()) as Submission;
        submissions.push(body);
        await delay(200);
        if (body.titleEn === 'Fail save')
          return HttpResponse.json({ message: 'Simulated save failure' }, { status: 500 });
        const contentBlocks = body.contentBlocks.map((block) => ({
          ...block,
          id: block.id ?? `block-${++sequence}`,
          photos: block.photos.map((photo) => ({
            ...photo,
            id: photo.id ?? `photo-${++sequence}`,
          })),
        }));
        const photos = [
          ...body.additionalMedia.map((photo) => ({
            ...photo,
            id: photo.id ?? `photo-${++sequence}`,
            contentBlockId: null,
          })),
          ...contentBlocks.flatMap((block) =>
            block.photos.map((photo) => ({ ...photo, contentBlockId: block.id }))
          ),
        ];
        const singular = params.owner === 'projects' ? 'project' : 'experiment';
        return HttpResponse.json({
          [singular]: {
            ...(singular === 'project' ? project : experiment),
            ...body,
            sections: project.sections,
            contentBlocks,
            photos,
          },
          cleanup: { failedAssetIds: [], deletedAssetIds: [] },
        });
      })
    );
  },
} satisfies Meta<typeof Forms>;
export default meta;
type Story = StoryObj<typeof meta>;

const exercise: Story['play'] = async ({ canvasElement, args }) => {
  const canvas = within(canvasElement);
  const tab = async (name: string) => {
    await userEvent.click(canvas.getByRole('tab', { name }));
  };
  const saveButton = canvas.getByRole('button', { name: 'Save changes' });
  const save = () => saveButton;
  const upload = async (scope: ReturnType<typeof within>, label: string, names: string[]) => {
    await userEvent.upload(
      scope.getByLabelText(label),
      names.map(
        (name) =>
          new File(['fixture'], name, { type: name.endsWith('.webm') ? 'video/webm' : 'image/png' })
      )
    );
    await waitFor(() => expect(save()).toBeEnabled());
  };
  await expect(save()).toBeDisabled();
  await expect(canvas.getByRole('button', { name: 'Discard' })).toBeDisabled();
  await expect(canvas.getByRole('status')).toHaveTextContent('All changes saved');
  const title = canvas.getByLabelText('Title (EN)', { exact: true });
  const ukTitle = canvas.getByLabelText('Title (UK)', { exact: true });
  const enRect = title.getBoundingClientRect();
  const ukRect = ukTitle.getBoundingClientRect();
  if (window.innerWidth >= 640) {
    await expect(enRect.top).toBe(ukRect.top);
    await expect(enRect.left).toBeLessThan(ukRect.left);
  } else {
    await expect(enRect.left).toBe(ukRect.left);
    await expect(enRect.top).toBeLessThan(ukRect.top);
  }
  await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  // Validation reveals the correct tab before focusing the invalid field.
  await userEvent.clear(title);
  await tab('Settings');
  await userEvent.click(save());
  await expect(canvas.getByRole('tab', { name: 'General' })).toHaveAttribute(
    'aria-selected',
    'true'
  );
  await expect(title).toHaveFocus();
  await userEvent.type(title, 'Edited across tabs');
  await userEvent.click(save());
  await expect(canvas.getByRole('status')).toHaveTextContent('Saving changes…');
  await expect(save()).toBeDisabled();
  await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('All changes saved'));
  await expect(submissions[0].coverAssetId).toBe('existing-cover');
  await expect(submissions[0].sections).toBeUndefined();
  await tab('Settings');
  await userEvent.selectOptions(canvas.getByLabelText('Detail page status (optional)'), 'DRAFT');
  await tab('Content');
  await userEvent.click(canvas.getByRole('button', { name: 'Add block' }));
  await userEvent.type(canvas.getByLabelText('Block 1 Title (EN, optional)'), 'First heading');
  await userEvent.type(canvas.getByLabelText('Block 1 Title (UK, optional)'), 'Заголовок');
  await userEvent.type(
    canvas.getByLabelText('Block 1 Body (EN, optional)'),
    'First paragraph.\n\nSecond paragraph.'
  );
  await userEvent.type(canvas.getByLabelText('Block 1 Body (UK, optional)'), 'Перший абзац.');
  await upload(
    within(canvas.getByRole('region', { name: 'ContentBlock media' })),
    'Upload photos / videos',
    ['block.png', 'clip.webm']
  );
  await waitFor(() => expect(canvas.getAllByText(/New · not saved/)).toHaveLength(2));
  await userEvent.click(canvas.getByRole('button', { name: 'Edit media 1' }));
  const drawer = within(canvas.getByRole('dialog', { name: 'Media details' }));
  await userEvent.type(drawer.getByLabelText('Caption (EN)'), 'Block caption');
  await userEvent.type(drawer.getByLabelText('Caption (UK)'), 'Підпис');
  await userEvent.type(drawer.getByLabelText('Description (UK)'), 'Опис');
  await upload(drawer, 'Upload Ukrainian', ['block-uk.png']);
  await userEvent.click(drawer.getByRole('button', { name: 'Done' }));
  await expect(canvas.getByRole('button', { name: 'Edit media 1' })).toHaveFocus();
  await userEvent.click(canvas.getByRole('button', { name: 'Move media 1 down' }));
  const accordion = canvas.getByRole('button', { name: /First heading.*2 media/ });
  await userEvent.click(accordion);
  await expect(accordion).toHaveAttribute('aria-expanded', 'false');
  await expect(canvas.getByLabelText('Block 1 Body (EN, optional)')).not.toBeVisible();
  await tab('Media');
  await expect(
    canvas.queryByRole('region', { name: 'ContentBlock media' })
  ).not.toBeInTheDocument();
  await upload(
    within(canvas.getByRole('region', { name: 'Additional Media' })),
    'Upload photos / videos',
    ['additional.png']
  );
  const covers = within(canvas.getByRole('region', { name: 'Cover' }));
  await upload(covers, 'Replace Default cover', ['cover.png']);
  await upload(covers, 'Replace Ukrainian cover', ['cover-uk.png']);
  await expect(covers.getByLabelText('Replace Default cover')).not.toHaveAttribute(
    'accept',
    expect.stringContaining('video/')
  );
  await expect(canvas.queryByText(/Reuse an image/)).not.toBeInTheDocument();
  await expect(canvas.queryByText('Add cover image here')).not.toBeInTheDocument();
  await tab('General');
  await expect(title).toHaveValue('Edited across tabs');
  await tab('Content');
  await expect(accordion).toHaveAttribute('aria-expanded', 'false');
  await userEvent.click(accordion);
  await expect(canvas.getByLabelText('Block 1 Title (UK, optional)')).toHaveValue('Заголовок');
  await userEvent.click(canvas.getByRole('button', { name: 'Add block' }));
  await userEvent.type(canvas.getByLabelText('Block 2 Title (EN, optional)'), 'Text only');
  await userEvent.click(canvas.getByRole('button', { name: 'Move block 2 up' }));
  await expect(canvas.getByLabelText('Block 1 Title (EN, optional)')).toHaveValue('Text only');
  await userEvent.click(canvas.getByRole('button', { name: 'Remove block 1' }));
  await userEvent.click(
    within(canvas.getByRole('dialog')).getByRole('button', { name: 'Remove block' })
  );
  await tab('Settings');
  await userEvent.click(save());
  await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('All changes saved'));
  const first = submissions.at(-1)!;
  await expect(first.coverAssetId).toBe('cover.png');
  await expect(first.coverAssetUkId).toBe('cover-uk.png');
  await expect(first.detailPageStatus).toBe('DRAFT');
  await expect(first.contentBlocks).toHaveLength(1);
  await expect(first.contentBlocks[0].photos.map((photo) => photo.assetId)).toEqual([
    'clip.webm',
    'block.png',
  ]);
  await expect(first.contentBlocks[0].photos[1].captionEn).toBe('Block caption');
  await expect(first.contentBlocks[0].photos[1].assetUkId).toBe('block-uk.png');
  await userEvent.selectOptions(
    canvas.getByLabelText('Detail page status (optional)'),
    'PUBLISHED'
  );
  await userEvent.click(save());
  await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('All changes saved'));
  await expect(submissions.at(-1)?.contentBlocks[0].id).toBeDefined();
  const second = submissions.at(-1)!;
  await userEvent.selectOptions(canvas.getByLabelText('Detail page status (optional)'), 'DRAFT');
  await userEvent.click(save());
  await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('All changes saved'));
  await expect(submissions.at(-1)?.contentBlocks).toEqual(second.contentBlocks);
  await tab('General');
  await userEvent.clear(title);
  await userEvent.type(title, 'Fail save');
  await tab('Media');
  await userEvent.click(save());
  await expect(await canvas.findByRole('alert')).toHaveTextContent('Simulated save failure');
  await expect(canvas.getByRole('status')).toHaveTextContent('Changes not saved');
  await expect(save()).toBeEnabled();
  const confirm = spyOn(window, 'confirm').mockReturnValue(false);
  try {
    await userEvent.click(canvas.getByRole('button', { name: 'Discard' }));
    await expect(confirm).toHaveBeenCalledOnce();
    await expect(title).toHaveValue('Fail save');
  } finally {
    confirm.mockRestore();
  }
  await tab('General');
  await userEvent.clear(title);
  await userEvent.type(title, 'Saved title');
  await tab('Media');
  await userEvent.click(
    covers.getByRole('button', { name: 'Remove cover and its Ukrainian variant' })
  );
  await userEvent.click(save());
  await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('All changes saved'));
  await expect(submissions.at(-1)?.coverAssetId).toBeNull();
  await expect(submissions.at(-1)?.contentBlocks).toEqual(second.contentBlocks);
  canvasElement.dataset.contentFormTest = `${args.ownerType}-passed`;
};
export const Project: Story = { play: exercise };
export const Experiment: Story = { args: { ownerType: 'experiments' }, play: exercise };
export const NewProject: Story = {
  args: { create: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const controls = canvasElement.querySelectorAll(
      'input[required],textarea[required],select[required]'
    );
    await expect(controls).toHaveLength(3);
    await userEvent.click(canvas.getByRole('tab', { name: 'Content' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Add block' }));
    await userEvent.type(
      canvas.getByLabelText('Block 1 Body (EN, optional)'),
      'Text before the first save.'
    );
    await expect(canvas.queryByLabelText('Upload photos / videos')).not.toBeInTheDocument();
    await expect(canvas.getByText('Unsaved changes', { exact: true })).toBeInTheDocument();
    canvasElement.dataset.contentFormTest = 'create-passed';
  },
};
