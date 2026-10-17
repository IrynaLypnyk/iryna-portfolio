'use client';

import { DetailPageStatus } from '@/generated/prisma/enums';
import type { Experiment as DbExperiment } from '@/generated/prisma/browser';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { EditorSaveBar } from '../../_components/EditorSaveBar';
import {
  useConfirmLeave,
  useUnsavedChanges,
} from '@/app/(admin)/admin/(protected)/_components/UnsavedChangesProvider';
import { AdminInput } from '@/app/(admin)/admin/(protected)/_components/AdminInput';
import { AdminTextarea } from '@/app/(admin)/admin/(protected)/_components/AdminTextarea';
import { apiRoutes, routes } from '@/constants/routes';

import { useOwnerMediaDraft } from '../../_components/useOwnerMediaDraft';
import { OwnerMediaFields } from '../../_components/OwnerMediaFields';
import { EditorTabs, EditorPanel, useEditorTabs } from '../../_components/EditorTabs';
import { DetailPageSettings } from '../../_components/DetailPageSettings';
import {
  ownerMediaInput,
  type OwnerMediaDraft,
  type SavedOwnerMedia,
} from '@/lib/media/owner-media-draft';

/** Every field is held as a string so the inputs stay controlled. */
type FormState = {
  slug: string;
  titleUk: string;
  titleEn: string;
  descriptionUk: string;
  descriptionEn: string;
  shortDescriptionUk: string;
  shortDescriptionEn: string;
  stack: string;
  demoUrl: string;
  githubUrl: string;
  order: string;
  published: boolean;
  detailPageStatus: DetailPageStatus;
};

type Props =
  | { mode: 'create'; experiment?: undefined; initialMedia?: undefined }
  | { mode: 'edit'; experiment: DbExperiment; initialMedia: OwnerMediaDraft };

function toFormState(experiment: DbExperiment | undefined): FormState {
  if (!experiment) {
    return {
      slug: '',
      titleUk: '',
      titleEn: '',
      descriptionUk: '',
      descriptionEn: '',
      shortDescriptionUk: '',
      shortDescriptionEn: '',
      stack: '',
      demoUrl: '',
      githubUrl: '',
      order: '0',
      published: true,
      detailPageStatus: DetailPageStatus.NONE,
    };
  }

  return {
    slug: experiment.slug,
    titleUk: experiment.titleUk,
    titleEn: experiment.titleEn,
    descriptionUk: experiment.descriptionUk,
    descriptionEn: experiment.descriptionEn,
    shortDescriptionUk: experiment.shortDescriptionUk,
    shortDescriptionEn: experiment.shortDescriptionEn,
    stack: experiment.stack ?? '',
    demoUrl: experiment.demoUrl ?? '',
    githubUrl: experiment.githubUrl ?? '',
    order: String(experiment.order),
    published: experiment.published,
    detailPageStatus: experiment.detailPageStatus,
  };
}

const labelStyles = 'mb-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase';

function snapshot(form: FormState) {
  return JSON.stringify(form);
}

export function ExperimentForm({ mode, experiment, initialMedia }: Props) {
  const router = useRouter();
  const tabs = useEditorTabs();
  const mediaDraft = useOwnerMediaDraft(initialMedia);
  const [form, setForm] = useState<FormState>(() => toFormState(experiment));
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [savedSnapshot, setSavedSnapshot] = useState(() => snapshot(form));
  const currentSnapshot = snapshot(form);
  const isDirty = currentSnapshot !== savedSnapshot || mediaDraft.isDirty;
  useUnsavedChanges(isDirty || mediaDraft.isUploading);
  const confirmLeave = useConfirmLeave();

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSaving || mediaDraft.isUploading) {
      return;
    }

    const element = event.currentTarget;
    if (!element.checkValidity()) {
      const invalid = element.querySelector<HTMLInputElement | HTMLTextAreaElement>(':invalid');
      tabs.reveal(invalid);
      setSaveError(invalid?.validationMessage || 'Please correct the highlighted fields.');
      return;
    }
    setIsSaving(true);
    setSaveError('');

    const payload = {
      ...form,
      ...ownerMediaInput(mediaDraft.media),
      order: Number(form.order || 0),
    };

    try {
      const url =
        mode === 'create' ? apiRoutes.admin.experiments : apiRoutes.admin.experiment(experiment.id);
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        message?: string;
        experiment?: DbExperiment & SavedOwnerMedia;
        cleanup?: { failedAssetIds: string[] };
      };

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save experiment');
      }

      toast.success(mode === 'create' ? 'Experiment created' : 'Experiment updated');
      setSavedSnapshot(currentSnapshot);
      if (result.experiment) mediaDraft.markSaved(result.experiment, mediaDraft.media);
      if (result.cleanup?.failedAssetIds.length)
        toast.warning('Changes saved. Some unused files could not be removed from storage.');

      if (mode === 'create' && result.experiment) {
        router.push(routes.admin.experiment(result.experiment.id));
      } else {
        router.refresh();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save experiment';
      setSaveError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="min-w-0 space-y-6">
      <div className="grid items-start gap-5 lg:grid-cols-[170px_minmax(0,1fr)] lg:gap-6">
        <EditorTabs tabs={tabs} />
        <div className="min-w-0 space-y-6">
          <EditorPanel tabs={tabs} name="General">
            <section className="space-y-4 rounded-sm border border-neutral-200 bg-white p-4 sm:p-5">
              <h2 className="text-base font-semibold">Basic information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className={labelStyles}>Slug</span>
                  <AdminInput
                    type="text"
                    required
                    value={form.slug}
                    onChange={(event) => updateField('slug', event.target.value)}
                    placeholder="ai-cv-assistant"
                  />
                </label>
                <label>
                  <span className={labelStyles}>Title (EN)</span>
                  <AdminInput
                    type="text"
                    required
                    value={form.titleEn}
                    onChange={(event) => updateField('titleEn', event.target.value)}
                  />
                </label>
                <label>
                  <span className={labelStyles}>Title (UK)</span>
                  <AdminInput
                    type="text"
                    required
                    value={form.titleUk}
                    onChange={(event) => updateField('titleUk', event.target.value)}
                  />
                </label>
              </div>
            </section>
            <section className="space-y-4 rounded-sm border border-neutral-200 bg-white p-4 sm:p-5">
              <h2 className="text-base font-semibold">Descriptions</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className={labelStyles}>Short description (EN, optional)</span>
                  <AdminTextarea
                    rows={2}
                    value={form.shortDescriptionEn}
                    onChange={(event) => updateField('shortDescriptionEn', event.target.value)}
                    placeholder="Short summary for the card"
                  />
                </label>
                <label>
                  <span className={labelStyles}>Short description (UK, optional)</span>
                  <AdminTextarea
                    rows={2}
                    value={form.shortDescriptionUk}
                    onChange={(event) => updateField('shortDescriptionUk', event.target.value)}
                    placeholder="Короткий опис для картки"
                  />
                </label>
                <label>
                  <span className={labelStyles}>Description (EN)</span>
                  <AdminTextarea
                    required
                    rows={3}
                    value={form.descriptionEn}
                    onChange={(event) => updateField('descriptionEn', event.target.value)}
                  />
                </label>
                <label>
                  <span className={labelStyles}>Description (UK)</span>
                  <AdminTextarea
                    required
                    rows={3}
                    value={form.descriptionUk}
                    onChange={(event) => updateField('descriptionUk', event.target.value)}
                  />
                </label>
              </div>
            </section>
            <section className="space-y-4 rounded-sm border border-neutral-200 bg-white p-4 sm:p-5">
              <h2 className="text-base font-semibold">Technology</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className={labelStyles}>{'Stack (optional)'}</span>
                  <AdminInput
                    type="text"
                    value={form.stack}
                    onChange={(event) => updateField('stack', event.target.value)}
                    placeholder="AI · Next.js · TypeScript"
                  />
                </label>
              </div>
            </section>
          </EditorPanel>
          <EditorPanel tabs={tabs} name="Content">
            <OwnerMediaFields
              view="content"
              ownerId={mode === 'edit' ? experiment.id : undefined}
              ownerType="experiments"
              media={mediaDraft.media}
              onChangeAction={mediaDraft.setMedia}
              onUploadingChangeAction={mediaDraft.onUploadingChange}
              disabled={isSaving || mediaDraft.isUploading}
            />
          </EditorPanel>
          <EditorPanel tabs={tabs} name="Media">
            <OwnerMediaFields
              view="media"
              ownerId={mode === 'edit' ? experiment.id : undefined}
              ownerType="experiments"
              media={mediaDraft.media}
              onChangeAction={mediaDraft.setMedia}
              onUploadingChangeAction={mediaDraft.onUploadingChange}
              disabled={isSaving || mediaDraft.isUploading}
            />
          </EditorPanel>
          <EditorPanel tabs={tabs} name="Settings">
            <DetailPageSettings
              value={form.detailPageStatus}
              onChangeAction={(value) => updateField('detailPageStatus', value)}
              disabled={isSaving || mediaDraft.isUploading}
            />
            <section className="space-y-4 rounded-sm border border-neutral-200 bg-white p-4 sm:p-5">
              <h2 className="text-base font-semibold">Publication & ordering</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className={labelStyles}>Order</span>
                  <AdminInput
                    type="number"
                    required
                    value={form.order}
                    onChange={(event) => updateField('order', event.target.value)}
                  />
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(event) => updateField('published', event.target.checked)}
                    className="h-4 w-4"
                  />
                  Published
                </label>
              </div>
            </section>
            <section className="space-y-4 rounded-sm border border-neutral-200 bg-white p-4 sm:p-5">
              <h2 className="text-base font-semibold">External links</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className={labelStyles}>{'Demo (optional)'}</span>
                  <AdminInput
                    type="url"
                    value={form.demoUrl}
                    onChange={(event) => updateField('demoUrl', event.target.value)}
                    placeholder="https://example.com"
                  />
                </label>
                <label>
                  <span className={labelStyles}>{'GitHub (optional)'}</span>
                  <AdminInput
                    type="url"
                    value={form.githubUrl}
                    onChange={(event) => updateField('githubUrl', event.target.value)}
                    placeholder="https://github.com/user/repo"
                  />
                </label>
              </div>
            </section>
          </EditorPanel>
          {saveError && (
            <p
              role="alert"
              className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              Changes not saved. {saveError}
            </p>
          )}
        </div>
      </div>
      <EditorSaveBar
        dirty={isDirty || mode === 'create'}
        error={!!saveError}
        saving={isSaving}
        uploading={mediaDraft.isUploading}
        onDiscardAction={() => {
          if (confirmLeave()) router.push(routes.admin.experiments);
        }}
      />
    </form>
  );
}
