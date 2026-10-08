'use client';

import type { Project as DbProject, ProjectSection as DbSection } from '@/generated/prisma/browser';
import { ProjectType, ProjectStatus } from '@/generated/prisma/enums';
import { createTranslator } from 'next-intl';
import messages from '@/messages/en.json';
import { AdminSelect } from '../../_components/AdminSelect';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { AdminButton } from '@/app/(admin)/admin/_components/AdminButton';
import {
  useConfirmLeave,
  useUnsavedChanges,
} from '@/app/(admin)/admin/(protected)/_components/UnsavedChangesProvider';
import { ProjectField, validateProjectControl } from './ProjectField';
import { apiRoutes, routes } from '@/constants/routes';
import { SectionsEditor, type SectionDraft } from './SectionsEditor';
import { FeaturesEditor, type FeatureDraft } from './FeaturesEditor';
import { StackInput } from './StackInput';

const tMetadata = createTranslator({ locale: 'en', messages, namespace: 'ProjectMetadata' });

/** Text and number inputs are held as strings to keep them controlled. */
type FormState = {
  type: ProjectType;
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
};

export type ProjectWithSections = DbProject & { sections: DbSection[] };

type Props =
  | { mode: 'create'; project?: undefined }
  | { mode: 'edit'; project: ProjectWithSections };

function toFormState(project: ProjectWithSections | undefined): FormState {
  if (!project) {
    return {
      type: ProjectType.PERSONAL,
      status: ProjectStatus.IN_DEVELOPMENT,
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
    };
  }

  return {
    type: project.type,
    status: project.status,
    slug: project.slug,
    shortLabel: project.shortLabel,
    titleUk: project.titleUk,
    titleEn: project.titleEn,
    subtitleUk: project.subtitleUk,
    subtitleEn: project.subtitleEn,
    contextUk: project.contextUk,
    contextEn: project.contextEn,
    leadUk: project.leadUk,
    leadEn: project.leadEn,
    roleUk: project.roleUk,
    roleEn: project.roleEn,
    stack: (project.stack ?? '').split(' · ').join(', '),
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
  };
}

function toSectionDrafts(project: ProjectWithSections | undefined): SectionDraft[] {
  if (!project) {
    return [];
  }

  return project.sections.map((section) => ({
    key: section.id,
    titleUk: section.titleUk,
    titleEn: section.titleEn,
    bodyUk: section.bodyUk,
    bodyEn: section.bodyEn,
    body2Uk: section.body2Uk ?? '',
    body2En: section.body2En ?? '',
  }));
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

function snapshot(form: FormState, sections: SectionDraft[], features: FeatureDraft[]) {
  return JSON.stringify({
    form,
    sections: sections.map(({ key: _key, ...section }) => section),
    features: features.map(({ uk, en }) => ({ uk, en })),
  });
}

export function ProjectForm({ mode, project }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => toFormState(project));
  const [sections, setSections] = useState<SectionDraft[]>(() => toSectionDrafts(project));
  const [features, setFeatures] = useState<FeatureDraft[]>(() =>
    toFeatureDrafts(project?.featuresUk ?? [], project?.featuresEn ?? [])
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(() => snapshot(form, sections, features));
  const currentSnapshot = snapshot(form, sections, features);
  const isDirty = currentSnapshot !== savedSnapshot;
  useUnsavedChanges(isDirty);
  const confirmLeave = useConfirmLeave();

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setFieldErrors((current) => ({ ...current, [key]: '' }));
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSaving) {
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
      firstInvalid?.focus();
      const message = firstInvalid?.validationMessage || 'Please correct the highlighted fields.';
      setSaveError(message);
      toast.error('Changes not saved', { description: message });
      return;
    }

    setIsSaving(true);

    const payload = {
      ...form,
      stack: form.stack
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .join(' · '),
      order: Number(form.order || 0),
      // `key` is a client-only React identity; the server rebuilds order from
      // array position.
      sections: sections.map(({ key: _key, ...section }) => section),
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
        project?: DbProject;
      };

      if (!response.ok) {
        if (result.field) {
          setFieldErrors({ [result.field]: result.message || 'Check this value.' });
          const control = formElement.elements.namedItem(result.field);
          if (control instanceof HTMLElement) control.focus();
        }
        throw new Error(
          result.message || 'The server could not save the project. Please try again.'
        );
      }

      toast.success(mode === 'create' ? 'Project created and saved' : 'Changes saved');
      // Only mark the submitted values as saved; edits made during the request remain dirty.
      setSavedSnapshot(currentSnapshot);

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
    <form noValidate onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-4 rounded-xl border border-neutral-200 bg-white p-5 sm:grid-cols-2">
        <label>
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
          <span className={labelStyles}>Short label</span>
          <ProjectField
            type="text"
            required
            name="shortLabel"
            error={fieldErrors.shortLabel}
            value={form.shortLabel}
            onChange={(event) => updateField('shortLabel', event.target.value)}
            placeholder="HELSI"
          />
        </label>

        <label>
          <span className={labelStyles}>Title (UA)</span>
          <ProjectField
            type="text"
            required
            name="titleUk"
            error={fieldErrors.titleUk}
            value={form.titleUk}
            onChange={(event) => updateField('titleUk', event.target.value)}
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
          <span className={labelStyles}>Підзаголовок (UA)</span>
          <ProjectField
            type="text"
            required
            name="subtitleUk"
            error={fieldErrors.subtitleUk}
            value={form.subtitleUk}
            onChange={(event) => updateField('subtitleUk', event.target.value)}
          />
        </label>

        <label>
          <span className={labelStyles}>Підзаголовок (EN)</span>
          <ProjectField
            type="text"
            required
            name="subtitleEn"
            error={fieldErrors.subtitleEn}
            value={form.subtitleEn}
            onChange={(event) => updateField('subtitleEn', event.target.value)}
          />
        </label>

        <label>
          <span className={labelStyles}>Home context (UA)</span>
          <ProjectField
            multiline
            required
            rows={3}
            name="contextUk"
            error={fieldErrors.contextUk}
            value={form.contextUk}
            onChange={(event) => updateField('contextUk', event.target.value)}
          />
        </label>

        <label>
          <span className={labelStyles}>Home context (EN)</span>
          <ProjectField
            multiline
            required
            rows={3}
            name="contextEn"
            error={fieldErrors.contextEn}
            value={form.contextEn}
            onChange={(event) => updateField('contextEn', event.target.value)}
          />
        </label>

        <label>
          <span className={labelStyles}>Лід case study (UA)</span>
          <ProjectField
            multiline
            required
            rows={4}
            name="leadUk"
            error={fieldErrors.leadUk}
            value={form.leadUk}
            onChange={(event) => updateField('leadUk', event.target.value)}
          />
        </label>

        <label>
          <span className={labelStyles}>Лід case study (EN)</span>
          <ProjectField
            multiline
            required
            rows={4}
            name="leadEn"
            error={fieldErrors.leadEn}
            value={form.leadEn}
            onChange={(event) => updateField('leadEn', event.target.value)}
          />
        </label>

        <label>
          <span className={labelStyles}>Role (UA)</span>
          <ProjectField
            type="text"
            required
            name="roleUk"
            error={fieldErrors.roleUk}
            value={form.roleUk}
            onChange={(event) => updateField('roleUk', event.target.value)}
          />
        </label>

        <label>
          <span className={labelStyles}>Role (EN)</span>
          <ProjectField
            type="text"
            required
            name="roleEn"
            error={fieldErrors.roleEn}
            value={form.roleEn}
            onChange={(event) => updateField('roleEn', event.target.value)}
          />
        </label>

        <label className="sm:col-span-2">
          <span className={labelStyles}>{'Stack (optional)'}</span>
          <StackInput
            value={form.stack}
            onChangeAction={(value: string) => updateField('stack', value)}
          />
        </label>

        <label>
          <span className={labelStyles}>{tMetadata('labelType')}</span>
          <AdminSelect
            required
            name="type"
            value={form.type}
            aria-invalid={!!fieldErrors.type}
            aria-describedby={fieldErrors.type ? 'type-error' : undefined}
            onChange={(event) => updateField('type', event.target.value as ProjectType)}
          >
            {Object.values(ProjectType).map((value) => (
              <option key={value} value={value}>
                {tMetadata(`types.${value}`)}
              </option>
            ))}
          </AdminSelect>
          {fieldErrors.type && (
            <span id="type-error" className="mt-1 block text-xs text-red-600">
              {fieldErrors.type}
            </span>
          )}
        </label>

        <label>
          <span className={labelStyles}>{tMetadata('labelStatus')}</span>
          <AdminSelect
            required
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
          <span className={labelStyles}>Order</span>
          <ProjectField
            type="number"
            required
            name="order"
            error={fieldErrors.order}
            value={form.order}
            onChange={(event) => updateField('order', event.target.value)}
          />
        </label>

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
          <span className={labelStyles}>Link label (UA)</span>
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
          <span className={labelStyles}>Link label (EN)</span>
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
          <span className={labelStyles}>Link note (UA)</span>
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
          <span className={labelStyles}>Link note (EN)</span>
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

        <div className="flex flex-wrap gap-6 sm:col-span-2">
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
      </div>

      <SectionsEditor sections={sections} onChangeAction={setSections} />

      <FeaturesEditor features={features} onChangeAction={setFeatures} />

      {saveError && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          Changes not saved. {saveError}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <span role="status" className="text-app-danger mr-auto text-sm">
          {isDirty ? 'Unsaved changes' : ''}
        </span>
        <AdminButton
          variant="outline"
          type="button"
          onClickAction={() => {
            if (confirmLeave()) router.push(routes.admin.projects);
          }}
          disabled={isSaving}
        >
          Discard changes
        </AdminButton>
        <AdminButton type="submit" tone={isDirty ? 'danger' : 'default'} disabled={isSaving}>
          {isSaving ? 'Saving…' : mode === 'create' ? 'Create project' : 'Save changes'}
        </AdminButton>
      </div>
    </form>
  );
}
