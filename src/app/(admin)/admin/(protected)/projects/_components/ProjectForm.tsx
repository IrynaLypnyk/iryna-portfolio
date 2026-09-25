'use client';

import type { Project as DbProject, ProjectSection as DbSection } from '@/generated/prisma/browser';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { AdminButton } from '@/app/(admin)/admin/_components/AdminButton';
import {
  useConfirmLeave,
  useUnsavedChanges,
} from '@/app/(admin)/admin/(protected)/_components/UnsavedChangesProvider';
import { AdminInput } from '@/app/(admin)/admin/(protected)/_components/AdminInput';
import { AdminTextarea } from '@/app/(admin)/admin/(protected)/_components/AdminTextarea';
import { apiRoutes, routes } from '@/constants/routes';
import { SectionsEditor, type SectionDraft } from './SectionsEditor';
import { FeaturesEditor, type FeatureDraft } from './FeaturesEditor';

/** Every field is held as a string so the inputs stay controlled. */
type FormState = {
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
    stack: project.stack ?? '',
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
  const [isSaving, setIsSaving] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(() => snapshot(form, sections, features));
  const currentSnapshot = snapshot(form, sections, features);
  const isDirty = currentSnapshot !== savedSnapshot;
  useUnsavedChanges(isDirty);
  const confirmLeave = useConfirmLeave();

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    setIsSaving(true);

    const payload = {
      ...form,
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

      const result = (await response.json()) as { message?: string; project?: DbProject };

      if (!response.ok) {
        throw new Error(result.message || 'Не вдалося зберегти проєкт');
      }

      toast.success(mode === 'create' ? 'Проєкт створено' : 'Проєкт оновлено');
      // Only mark the submitted values as saved; edits made during the request remain dirty.
      setSavedSnapshot(currentSnapshot);

      if (mode === 'create' && result.project) {
        router.push(routes.admin.project(result.project.id));
      } else {
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не вдалося зберегти проєкт');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-4 rounded-xl border border-neutral-200 bg-white p-5 sm:grid-cols-2">
        <label>
          <span className={labelStyles}>Slug</span>
          <AdminInput
            type="text"
            required
            value={form.slug}
            onChange={(event) => updateField('slug', event.target.value)}
            placeholder="sample-project"
          />
        </label>

        <label>
          <span className={labelStyles}>Коротка мітка</span>
          <AdminInput
            type="text"
            required
            value={form.shortLabel}
            onChange={(event) => updateField('shortLabel', event.target.value)}
            placeholder="HELSI"
          />
        </label>

        <label>
          <span className={labelStyles}>Назва (UA)</span>
          <AdminInput
            type="text"
            required
            value={form.titleUk}
            onChange={(event) => updateField('titleUk', event.target.value)}
          />
        </label>

        <label>
          <span className={labelStyles}>Назва (EN)</span>
          <AdminInput
            type="text"
            required
            value={form.titleEn}
            onChange={(event) => updateField('titleEn', event.target.value)}
          />
        </label>

        <label>
          <span className={labelStyles}>Підзаголовок (UA)</span>
          <AdminInput
            type="text"
            required
            value={form.subtitleUk}
            onChange={(event) => updateField('subtitleUk', event.target.value)}
          />
        </label>

        <label>
          <span className={labelStyles}>Підзаголовок (EN)</span>
          <AdminInput
            type="text"
            required
            value={form.subtitleEn}
            onChange={(event) => updateField('subtitleEn', event.target.value)}
          />
        </label>

        <label>
          <span className={labelStyles}>Контекст на головній (UA)</span>
          <AdminTextarea
            required
            rows={3}
            value={form.contextUk}
            onChange={(event) => updateField('contextUk', event.target.value)}
          />
        </label>

        <label>
          <span className={labelStyles}>Контекст на головній (EN)</span>
          <AdminTextarea
            required
            rows={3}
            value={form.contextEn}
            onChange={(event) => updateField('contextEn', event.target.value)}
          />
        </label>

        <label>
          <span className={labelStyles}>Лід case study (UA)</span>
          <AdminTextarea
            required
            rows={4}
            value={form.leadUk}
            onChange={(event) => updateField('leadUk', event.target.value)}
          />
        </label>

        <label>
          <span className={labelStyles}>Лід case study (EN)</span>
          <AdminTextarea
            required
            rows={4}
            value={form.leadEn}
            onChange={(event) => updateField('leadEn', event.target.value)}
          />
        </label>

        <label>
          <span className={labelStyles}>Роль (UA)</span>
          <AdminInput
            type="text"
            required
            value={form.roleUk}
            onChange={(event) => updateField('roleUk', event.target.value)}
          />
        </label>

        <label>
          <span className={labelStyles}>Роль (EN)</span>
          <AdminInput
            type="text"
            required
            value={form.roleEn}
            onChange={(event) => updateField('roleEn', event.target.value)}
          />
        </label>

        <label className="sm:col-span-2">
          <span className={labelStyles}>{"Стек (необов'язково)"}</span>
          <AdminInput
            type="text"
            value={form.stack}
            onChange={(event) => updateField('stack', event.target.value)}
            placeholder="React · TypeScript · Redux"
          />
        </label>

        <label>
          <span className={labelStyles}>{"Статус (UA, необов'язково)"}</span>
          <AdminInput
            type="text"
            value={form.statusUk}
            onChange={(event) => updateField('statusUk', event.target.value)}
            placeholder="У розробці"
          />
        </label>

        <label>
          <span className={labelStyles}>{"Статус (EN, необов'язково)"}</span>
          <AdminInput
            type="text"
            value={form.statusEn}
            onChange={(event) => updateField('statusEn', event.target.value)}
            placeholder="In development"
          />
        </label>

        <label>
          <span className={labelStyles}>{"Рік (необов'язково)"}</span>
          <AdminInput
            type="text"
            value={form.yearLabel}
            onChange={(event) => updateField('yearLabel', event.target.value)}
            placeholder="2019 — 2024"
          />
        </label>

        <label>
          <span className={labelStyles}>Порядок</span>
          <AdminInput
            type="number"
            required
            value={form.order}
            onChange={(event) => updateField('order', event.target.value)}
          />
        </label>

        <label className="sm:col-span-2">
          <span className={labelStyles}>{"Зовнішнє посилання (необов'язково)"}</span>
          <AdminInput
            type="url"
            value={form.externalUrl}
            onChange={(event) => updateField('externalUrl', event.target.value)}
            placeholder="https://example.com"
          />
        </label>

        <label>
          <span className={labelStyles}>Підпис посилання (UA)</span>
          <AdminInput
            type="text"
            value={form.linkLabelUk}
            onChange={(event) => updateField('linkLabelUk', event.target.value)}
            placeholder="Продукт онлайн"
          />
        </label>

        <label>
          <span className={labelStyles}>Підпис посилання (EN)</span>
          <AdminInput
            type="text"
            value={form.linkLabelEn}
            onChange={(event) => updateField('linkLabelEn', event.target.value)}
            placeholder="Live product"
          />
        </label>

        <label>
          <span className={labelStyles}>Примітка до посилань (UA)</span>
          <AdminTextarea
            rows={2}
            value={form.linkNoteUk}
            onChange={(event) => updateField('linkNoteUk', event.target.value)}
          />
        </label>

        <label>
          <span className={labelStyles}>Примітка до посилань (EN)</span>
          <AdminTextarea
            rows={2}
            value={form.linkNoteEn}
            onChange={(event) => updateField('linkNoteEn', event.target.value)}
          />
        </label>

        <label>
          <span className={labelStyles}>{"GitHub (необов'язково)"}</span>
          <AdminInput
            type="url"
            value={form.githubUrl}
            onChange={(event) => updateField('githubUrl', event.target.value)}
            placeholder="https://github.com/user/repo"
          />
        </label>

        <label>
          <span className={labelStyles}>{"Storybook (необов'язково)"}</span>
          <AdminInput
            type="url"
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
            У «Вибраних проєктах»
          </label>

          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(event) => updateField('published', event.target.checked)}
              className="h-4 w-4"
            />
            Опубліковано
          </label>
        </div>
      </div>

      <SectionsEditor sections={sections} onChangeAction={setSections} />

      <FeaturesEditor features={features} onChangeAction={setFeatures} />

      <div className="flex flex-wrap items-center justify-end gap-3">
        <span role="status" className="text-app-danger mr-auto text-sm">
          {isDirty ? 'Є незбережені зміни' : ''}
        </span>
        <AdminButton
          variant="outline"
          type="button"
          onClickAction={() => {
            if (confirmLeave()) router.push(routes.admin.projects);
          }}
          disabled={isSaving}
        >
          Скасувати зміни
        </AdminButton>
        <AdminButton type="submit" tone={isDirty ? 'danger' : 'default'} disabled={isSaving}>
          {isSaving ? 'Збереження…' : mode === 'create' ? 'Створити проєкт' : 'Зберегти зміни'}
        </AdminButton>
      </div>
    </form>
  );
}
