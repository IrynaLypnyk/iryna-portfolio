'use client';

import type { Project as DbProject, ProjectSection as DbSection } from '@/generated/prisma/browser';
import { DetailPageStatus, ProjectStatus } from '@/generated/prisma/enums';
import { createTranslator } from 'next-intl';
import messages from '@/messages/en.json';
import { AdminSelect } from '../../_components/AdminSelect';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { EditorSaveBar } from '../../_components/EditorSaveBar';
import {
  useConfirmLeave,
  useUnsavedChanges,
} from '@/app/(admin)/admin/(protected)/_components/UnsavedChangesProvider';
import { ProjectField, validateProjectControl } from './ProjectField';
import { apiRoutes, routes } from '@/constants/routes';
import { FeaturesEditor, type FeatureDraft } from './FeaturesEditor';
import { StackInput } from './StackInput';

const tMetadata = createTranslator({ locale: 'en', messages, namespace: 'ProjectMetadata' });

import { useOwnerMediaDraft } from '../../_components/useOwnerMediaDraft';
import { OwnerMediaFields } from '../../_components/OwnerMediaFields';
import { EditorTabs, EditorPanel, useEditorTabs } from '../../_components/EditorTabs';
import { DetailPageSettings } from '../../_components/DetailPageSettings';
import {
  ownerMediaInput,
  type OwnerMediaDraft,
  type SavedOwnerMedia,
} from '@/lib/media/owner-media-draft';

/** Text and number inputs are held as strings to keep them controlled. */
type FormState = {
  featuresTitleEn: string;
  featuresTitleUk: string;
  projectTypeEn: string;
  projectTypeUk: string;
  status: ProjectStatus;
  slug: string;
  shortLabel: string;
  titleUk: string;
  titleEn: string;
  subtitleUk: string;
  subtitleEn: string;
  contextUk: string;
  contextEn: string;
  leadUk: string;
  leadEn: string;
  roleUk: string;
  roleEn: string;
  stack: string;
  statusUk: string;
  statusEn: string;
  yearLabel: string;
  externalUrl: string;
  linkLabelUk: string;
  linkLabelEn: string;
  linkNoteUk: string;
  linkNoteEn: string;
  githubUrl: string;
  storybookUrl: string;
  order: string;
  featured: boolean;
  published: boolean;
  detailPageStatus: DetailPageStatus;
};

export type ProjectWithSections = DbProject & { sections: DbSection[] };

type Props =
  | { mode: 'create'; project?: undefined; initialMedia?: undefined }
  | { mode: 'edit'; project: ProjectWithSections; initialMedia: OwnerMediaDraft };

function toFormState(project: ProjectWithSections | undefined): FormState {
  if (!project) {
    return {
      featuresTitleEn: '',
      featuresTitleUk: '',
      projectTypeEn: '',
      projectTypeUk: '',
      status: ProjectStatus.COMPLETED,
      slug: '',
      shortLabel: '',
      titleUk: '',
      titleEn: '',
      subtitleUk: '',
      subtitleEn: '',
      contextUk: '',
      contextEn: '',
      leadUk: '',
      leadEn: '',
      roleUk: '',
      roleEn: '',
      stack: '',
      statusUk: '',
      statusEn: '',
      yearLabel: '',
      externalUrl: '',
      linkLabelUk: '',
      linkLabelEn: '',
      linkNoteUk: '',
      linkNoteEn: '',
      githubUrl: '',
      storybookUrl: '',
      order: '0',
      featured: false,
      published: true,
      detailPageStatus: DetailPageStatus.NONE,
    };
  }

  return {
    featuresTitleEn: project.featuresTitleEn ?? '',
    featuresTitleUk: project.featuresTitleUk ?? '',
    projectTypeEn: project.projectTypeEn ?? '',
    projectTypeUk: project.projectTypeUk ?? '',
    status: project.status,
    slug: project.slug,
    shortLabel: project.shortLabel ?? '',
    titleUk: project.titleUk,
    titleEn: project.titleEn,
    subtitleUk: project.subtitleUk ?? '',
    subtitleEn: project.subtitleEn ?? '',
    contextUk: project.contextUk ?? '',
    contextEn: project.contextEn ?? '',
    leadUk: project.leadUk ?? '',
    leadEn: project.leadEn ?? '',
    roleUk: project.roleUk ?? '',
    roleEn: project.roleEn ?? '',
    stack: project.stack.join(', '),
    statusUk: project.statusUk ?? '',
    statusEn: project.statusEn ?? '',
    yearLabel: project.yearLabel ?? '',
    externalUrl: project.externalUrl ?? '',
    linkLabelUk: project.linkLabelUk ?? '',
    linkLabelEn: project.linkLabelEn ?? '',
    linkNoteUk: project.linkNoteUk ?? '',
    linkNoteEn: project.linkNoteEn ?? '',
    githubUrl: project.githubUrl ?? '',
    storybookUrl: project.storybookUrl ?? '',
    order: String(project.order),
    featured: project.featured,
    published: project.published,
    detailPageStatus: project.detailPageStatus,
  };
}

/**
 * Zips the two locale arrays into paired drafts by position. Falls back to an
 * empty string on either side if a legacy project has mismatched lengths.
 */
function toFeatureDrafts(featuresUk: string[], featuresEn: string[]): FeatureDraft[] {
  const length = Math.max(featuresUk.length, featuresEn.length);

  return Array.from({ length }, (_unused, index) => ({
    key: crypto.randomUUID(),
    uk: featuresUk[index] ?? '',
    en: featuresEn[index] ?? '',
  }));
}

const labelStyles = 'mb-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase';

function snapshot(form: FormState, features: FeatureDraft[]) {
  return JSON.stringify({
    form,
    features: features.map(({ uk, en }) => ({ uk, en })),
  });
}

export function ProjectForm({ mode, project, initialMedia }: Props) {
  const router = useRouter();
  const tabs = useEditorTabs();
  const mediaDraft = useOwnerMediaDraft(initialMedia);
  const [form, setForm] = useState<FormState>(() => toFormState(project));
  const [features, setFeatures] = useState<FeatureDraft[]>(() =>
    toFeatureDrafts(project?.featuresUk ?? [], project?.featuresEn ?? [])
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(() => snapshot(form, features));
  const currentSnapshot = snapshot(form, features);
  const isDirty = currentSnapshot !== savedSnapshot || mediaDraft.isDirty;
  useUnsavedChanges(isDirty || mediaDraft.isUploading);
  const confirmLeave = useConfirmLeave();

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setFieldErrors((current) => ({ ...current, [key]: '' }));
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSaving || mediaDraft.isUploading) {
      return;
    }

    const formElement = event.currentTarget;
    setSaveError('');
    setFieldErrors({});
    for (const control of Array.from(formElement.elements)) {
      if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) {
        validateProjectControl(control);
      }
    }
    if (!formElement.checkValidity()) {
      const firstInvalid = formElement.querySelector<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >(':invalid');
      tabs.reveal(firstInvalid);
      const message = firstInvalid?.validationMessage || 'Please correct the highlighted fields.';
      setSaveError(message);
      toast.error('Changes not saved', { description: message });
      return;
    }

    setIsSaving(true);

    const payload = {
      ...ownerMediaInput(mediaDraft.media),
      ...form,
      stack: form.stack
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      order: Number(form.order || 0),
      featuresUk: features.map(({ uk }) => uk),
      featuresEn: features.map(({ en }) => en),
    };

    try {
      const url =
        mode === 'create' ? apiRoutes.admin.projects : apiRoutes.admin.project(project.id);
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => ({}))) as {
        message?: string;
        field?: string;
        project?: ProjectWithSections & SavedOwnerMedia;
        cleanup?: { failedAssetIds: string[] };
      };

      if (!response.ok) {
        if (result.field) {
          setFieldErrors({ [result.field]: result.message || 'Check this value.' });
          const control = formElement.elements.namedItem(result.field);
          if (control instanceof HTMLElement) tabs.reveal(control);
        }
        throw new Error(
          result.message || 'The server could not save the project. Please try again.'
        );
      }

      toast.success(mode === 'create' ? 'Project created and saved' : 'Changes saved');
      // Only mark the submitted values as saved; edits made during the request remain dirty.
      setSavedSnapshot(currentSnapshot);
      if (result.project) mediaDraft.markSaved(result.project, mediaDraft.media);
      if (result.cleanup?.failedAssetIds.length)
        toast.warning('Changes saved. Some unused files could not be removed from storage.');
      if (mode === 'create' && result.project) {
        router.push(routes.admin.project(result.project.id));
      } else {
        router.refresh();
      }
    } catch (error) {
      const message =
        error instanceof TypeError
          ? 'Could not reach the server. Check your connection and try again.'
          : error instanceof Error
            ? error.message
            : 'Please try saving again.';
      setSaveError(message);
      toast.error('Changes not saved', { description: message });
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
                  <ProjectField
                    type="text"
                    required
                    name="slug"
                    error={fieldErrors.slug}
                    value={form.slug}
                    onChange={(event) => updateField('slug', event.target.value)}
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    title="Use lowercase letters, numbers and single hyphens, for example sample-project."
                    placeholder="sample-project"
                  />
                </label>
                <label>
                  <span className={labelStyles}>Title (EN)</span>
                  <ProjectField
                    type="text"
                    required
                    name="titleEn"
                    error={fieldErrors.titleEn}
                    value={form.titleEn}
                    onChange={(event) => updateField('titleEn', event.target.value)}
                  />
                </label>
                <label>
                  <span className={labelStyles}>Title (UK)</span>
                  <ProjectField
                    type="text"
                    required
                    name="titleUk"
                    error={fieldErrors.titleUk}
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
                  <span className={labelStyles}>Subtitle (EN) (optional)</span>
                  <ProjectField
                    type="text"
                    name="subtitleEn"
                    error={fieldErrors.subtitleEn}
                    value={form.subtitleEn}
                    onChange={(event) => updateField('subtitleEn', event.target.value)}
                  />
                </label>
                <label>
                  <span className={labelStyles}>Subtitle (UK) (optional)</span>
                  <ProjectField
                    type="text"
                    name="subtitleUk"
                    error={fieldErrors.subtitleUk}
                    value={form.subtitleUk}
                    onChange={(event) => updateField('subtitleUk', event.target.value)}
                  />
                </label>
                <label>
                  <span className={labelStyles}>Home context (EN) (optional)</span>
                  <ProjectField
                    multiline
                    rows={3}
                    name="contextEn"
                    error={fieldErrors.contextEn}
                    value={form.contextEn}
                    onChange={(event) => updateField('contextEn', event.target.value)}
                  />
                </label>
                <label>
                  <span className={labelStyles}>Home context (UK) (optional)</span>
                  <ProjectField
                    multiline
                    rows={3}
                    name="contextUk"
                    error={fieldErrors.contextUk}
                    value={form.contextUk}
                    onChange={(event) => updateField('contextUk', event.target.value)}
                  />
                </label>
                <label>
                  <span className={labelStyles}>Lead (EN) (optional)</span>
                  <ProjectField
                    multiline
                    rows={4}
                    name="leadEn"
                    error={fieldErrors.leadEn}
                    value={form.leadEn}
                    onChange={(event) => updateField('leadEn', event.target.value)}
                  />
                </label>
                <label>
                  <span className={labelStyles}>Lead (UK) (optional)</span>
                  <ProjectField
                    multiline
                    rows={4}
                    name="leadUk"
                    error={fieldErrors.leadUk}
                    value={form.leadUk}
                    onChange={(event) => updateField('leadUk', event.target.value)}
                  />
                </label>
                <label>
                  <span className={labelStyles}>Role (EN) (optional)</span>
                  <ProjectField
                    type="text"
                    name="roleEn"
                    error={fieldErrors.roleEn}
                    value={form.roleEn}
                    onChange={(event) => updateField('roleEn', event.target.value)}
                  />
                </label>
                <label>
                  <span className={labelStyles}>Role (UK) (optional)</span>
                  <ProjectField
                    type="text"
                    name="roleUk"
                    error={fieldErrors.roleUk}
                    value={form.roleUk}
                    onChange={(event) => updateField('roleUk', event.target.value)}
                  />
                </label>
              </div>
            </section>
            <section className="space-y-4 rounded-sm border border-neutral-200 bg-white p-4 sm:p-5">
              <h2 className="text-base font-semibold">Project metadata</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className={labelStyles}>Short label (optional)</span>
                  <ProjectField
                    type="text"
                    name="shortLabel"
                    error={fieldErrors.shortLabel}
                    value={form.shortLabel}
                    onChange={(event) => updateField('shortLabel', event.target.value)}
                    placeholder="HELSI"
                  />
                </label>
                <label>
                  <span className={labelStyles}>{'Year (optional)'}</span>
                  <ProjectField
                    type="text"
                    name="yearLabel"
                    error={fieldErrors.yearLabel}
                    value={form.yearLabel}
                    onChange={(event) => updateField('yearLabel', event.target.value)}
                    placeholder="2019 — 2024"
                  />
                </label>
                <label>
                  <span className={labelStyles}>{tMetadata('labelType')} (EN, optional)</span>
                  <ProjectField
                    type="text"
                    name="projectTypeEn"
                    error={fieldErrors.projectTypeEn}
                    value={form.projectTypeEn}
                    onChange={(event) => updateField('projectTypeEn', event.target.value)}
                  />
                </label>
                <label>
                  <span className={labelStyles}>{tMetadata('labelType')} (UK, optional)</span>
                  <ProjectField
                    type="text"
                    name="projectTypeUk"
                    error={fieldErrors.projectTypeUk}
                    value={form.projectTypeUk}
                    onChange={(event) => updateField('projectTypeUk', event.target.value)}
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className={labelStyles}>{'Stack (optional)'}</span>
                  <StackInput
                    value={form.stack}
                    onChangeAction={(value: string) => updateField('stack', value)}
                  />
                </label>
              </div>
            </section>
            <section className="space-y-4 rounded-sm border border-neutral-200 bg-white p-4 sm:p-5">
              <h2 className="text-base font-semibold">Features</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className={labelStyles}>Features title (EN, optional)</span>
                  <ProjectField
                    type="text"
                    name="featuresTitleEn"
                    error={fieldErrors.featuresTitleEn}
                    value={form.featuresTitleEn}
                    onChange={(event) => updateField('featuresTitleEn', event.target.value)}
                    placeholder="Key Features"
                  />
                </label>
                <label>
                  <span className={labelStyles}>Features title (UK, optional)</span>
                  <ProjectField
                    type="text"
                    name="featuresTitleUk"
                    error={fieldErrors.featuresTitleUk}
                    value={form.featuresTitleUk}
                    onChange={(event) => updateField('featuresTitleUk', event.target.value)}
                    placeholder="Ключові можливості"
                  />
                </label>
              </div>
            </section>
            <FeaturesEditor features={features} onChangeAction={setFeatures} />
          </EditorPanel>
          <EditorPanel tabs={tabs} name="Content">
            <OwnerMediaFields
              view="content"
              ownerId={mode === 'edit' ? project.id : undefined}
              ownerType="projects"
              media={mediaDraft.media}
              onChangeAction={mediaDraft.setMedia}
              onUploadingChangeAction={mediaDraft.onUploadingChange}
              disabled={isSaving || mediaDraft.isUploading}
            />
          </EditorPanel>
          <EditorPanel tabs={tabs} name="Media">
            <OwnerMediaFields
              view="media"
              ownerId={mode === 'edit' ? project.id : undefined}
              ownerType="projects"
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
                  <span className={labelStyles}>{tMetadata('labelStatus')}</span>
                  <AdminSelect
                    name="status"
                    value={form.status}
                    aria-invalid={!!fieldErrors.status}
                    aria-describedby={fieldErrors.status ? 'status-error' : undefined}
                    onChange={(event) => updateField('status', event.target.value as ProjectStatus)}
                  >
                    {Object.values(ProjectStatus).map((value) => (
                      <option key={value} value={value}>
                        {tMetadata(`statuses.${value}`)}
                      </option>
                    ))}
                  </AdminSelect>
                  {fieldErrors.status && (
                    <span id="status-error" className="mt-1 block text-xs text-red-600">
                      {fieldErrors.status}
                    </span>
                  )}
                </label>
                <label>
                  <span className={labelStyles}>Order</span>
                  <ProjectField
                    type="number"
                    name="order"
                    error={fieldErrors.order}
                    value={form.order}
                    onChange={(event) => updateField('order', event.target.value)}
                  />
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(event) => updateField('featured', event.target.checked)}
                    className="h-4 w-4"
                  />
                  In Featured projects
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
                <label className="sm:col-span-2">
                  <span className={labelStyles}>{'External link (optional)'}</span>
                  <ProjectField
                    type="url"
                    name="externalUrl"
                    error={fieldErrors.externalUrl}
                    value={form.externalUrl}
                    onChange={(event) => updateField('externalUrl', event.target.value)}
                    placeholder="https://example.com"
                  />
                </label>
                <label>
                  <span className={labelStyles}>Link label (EN) (optional)</span>
                  <ProjectField
                    type="text"
                    name="linkLabelEn"
                    error={fieldErrors.linkLabelEn}
                    value={form.linkLabelEn}
                    onChange={(event) => updateField('linkLabelEn', event.target.value)}
                    placeholder="Live product"
                  />
                </label>
                <label>
                  <span className={labelStyles}>Link label (UK) (optional)</span>
                  <ProjectField
                    type="text"
                    name="linkLabelUk"
                    error={fieldErrors.linkLabelUk}
                    value={form.linkLabelUk}
                    onChange={(event) => updateField('linkLabelUk', event.target.value)}
                    placeholder="Продукт онлайн"
                  />
                </label>
                <label>
                  <span className={labelStyles}>Link note (EN) (optional)</span>
                  <ProjectField
                    multiline
                    rows={2}
                    name="linkNoteEn"
                    error={fieldErrors.linkNoteEn}
                    value={form.linkNoteEn}
                    onChange={(event) => updateField('linkNoteEn', event.target.value)}
                  />
                </label>
                <label>
                  <span className={labelStyles}>Link note (UK) (optional)</span>
                  <ProjectField
                    multiline
                    rows={2}
                    name="linkNoteUk"
                    error={fieldErrors.linkNoteUk}
                    value={form.linkNoteUk}
                    onChange={(event) => updateField('linkNoteUk', event.target.value)}
                  />
                </label>
                <label>
                  <span className={labelStyles}>{'GitHub (optional)'}</span>
                  <ProjectField
                    type="url"
                    name="githubUrl"
                    error={fieldErrors.githubUrl}
                    value={form.githubUrl}
                    onChange={(event) => updateField('githubUrl', event.target.value)}
                    placeholder="https://github.com/user/repo"
                  />
                </label>
                <label>
                  <span className={labelStyles}>{'Storybook (optional)'}</span>
                  <ProjectField
                    type="url"
                    name="storybookUrl"
                    error={fieldErrors.storybookUrl}
                    value={form.storybookUrl}
                    onChange={(event) => updateField('storybookUrl', event.target.value)}
                    placeholder="https://example.storybook.io"
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
          if (confirmLeave()) router.push(routes.admin.projects);
        }}
      />
    </form>
  );
}
