'use client';

import type { Experiment as DbExperiment } from '@/generated/prisma/browser';
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

/** Every field is held as a string so the inputs stay controlled. */
type FormState = {
  slug: string;
  titleUk: string;
  titleEn: string;
  descriptionUk: string;
  descriptionEn: string;
  stack: string;
  demoUrl: string;
  githubUrl: string;
  order: string;
  published: boolean;
};

type Props =
  | { mode: 'create'; experiment?: undefined }
  | { mode: 'edit'; experiment: DbExperiment };

function toFormState(experiment: DbExperiment | undefined): FormState {
  if (!experiment) {
    return {
      slug: '',
      titleUk: '',
      titleEn: '',
      descriptionUk: '',
      descriptionEn: '',
      stack: '',
      demoUrl: '',
      githubUrl: '',
      order: '0',
      published: true,
    };
  }

  return {
    slug: experiment.slug,
    titleUk: experiment.titleUk,
    titleEn: experiment.titleEn,
    descriptionUk: experiment.descriptionUk,
    descriptionEn: experiment.descriptionEn,
    stack: experiment.stack ?? '',
    demoUrl: experiment.demoUrl ?? '',
    githubUrl: experiment.githubUrl ?? '',
    order: String(experiment.order),
    published: experiment.published,
  };
}

const labelStyles = 'mb-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase';

function snapshot(form: FormState) {
  return JSON.stringify(form);
}

export function ExperimentForm({ mode, experiment }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => toFormState(experiment));
  const [isSaving, setIsSaving] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(() => snapshot(form));
  const currentSnapshot = snapshot(form);
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

    const payload = { ...form, order: Number(form.order || 0) };

    try {
      const url =
        mode === 'create' ? apiRoutes.admin.experiments : apiRoutes.admin.experiment(experiment.id);
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { message?: string; experiment?: DbExperiment };

      if (!response.ok) {
        throw new Error(result.message || 'Не вдалося зберегти експеримент');
      }

      toast.success(mode === 'create' ? 'Експеримент створено' : 'Експеримент оновлено');
      setSavedSnapshot(currentSnapshot);

      if (mode === 'create' && result.experiment) {
        router.push(routes.admin.experiment(result.experiment.id));
      } else {
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не вдалося зберегти експеримент');
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
            placeholder="ai-cv-assistant"
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
          <span className={labelStyles}>Опис (UA)</span>
          <AdminTextarea
            required
            rows={3}
            value={form.descriptionUk}
            onChange={(event) => updateField('descriptionUk', event.target.value)}
          />
        </label>

        <label>
          <span className={labelStyles}>Опис (EN)</span>
          <AdminTextarea
            required
            rows={3}
            value={form.descriptionEn}
            onChange={(event) => updateField('descriptionEn', event.target.value)}
          />
        </label>

        <label className="sm:col-span-2">
          <span className={labelStyles}>{"Стек (необов'язково)"}</span>
          <AdminInput
            type="text"
            value={form.stack}
            onChange={(event) => updateField('stack', event.target.value)}
            placeholder="AI · Next.js · TypeScript"
          />
        </label>

        <label>
          <span className={labelStyles}>{"Демо (необов'язково)"}</span>
          <AdminInput
            type="url"
            value={form.demoUrl}
            onChange={(event) => updateField('demoUrl', event.target.value)}
            placeholder="https://example.com"
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

        <div className="sm:col-span-2">
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

      <div className="flex flex-wrap items-center justify-end gap-3">
        <span role="status" className="text-app-danger mr-auto text-sm">
          {isDirty ? 'Є незбережені зміни' : ''}
        </span>
        <AdminButton
          variant="outline"
          type="button"
          onClickAction={() => {
            if (confirmLeave()) router.push(routes.admin.experiments);
          }}
          disabled={isSaving}
        >
          Скасувати зміни
        </AdminButton>
        <AdminButton type="submit" tone={isDirty ? 'danger' : 'default'} disabled={isSaving}>
          {isSaving ? 'Збереження…' : mode === 'create' ? 'Створити експеримент' : 'Зберегти зміни'}
        </AdminButton>
      </div>
    </form>
  );
}
