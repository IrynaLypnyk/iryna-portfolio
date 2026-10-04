'use client';

import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { AdminButton } from '@/app/(admin)/admin/_components/AdminButton';
import { AdminInput } from '@/app/(admin)/admin/(protected)/_components/AdminInput';
import { AdminTextarea } from '@/app/(admin)/admin/(protected)/_components/AdminTextarea';

export type SectionDraft = {
  /** Stable key for React only — never sent to the API. */
  key: string;
  titleUk: string;
  titleEn: string;
  bodyUk: string;
  bodyEn: string;
  body2Uk: string;
  body2En: string;
};

export function createSectionDraft(): SectionDraft {
  return {
    key: crypto.randomUUID(),
    titleUk: '',
    titleEn: '',
    bodyUk: '',
    bodyEn: '',
    body2Uk: '',
    body2En: '',
  };
}

const labelStyles = 'mb-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase';

type Props = {
  sections: SectionDraft[];
  onChangeAction: (sections: SectionDraft[]) => void;
};

/**
 * Editor for the numbered case-study blocks.
 *
 * Order is the array order — the numbering shown on the public page is derived
 * from position, so moving a row is the only thing that renumbers it.
 */
export function SectionsEditor({ sections, onChangeAction }: Props) {
  function update(key: string, field: keyof Omit<SectionDraft, 'key'>, value: string) {
    onChangeAction(
      sections.map((section) => (section.key === key ? { ...section, [field]: value } : section))
    );
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;

    if (target < 0 || target >= sections.length) {
      return;
    }

    const next = sections.slice();
    [next[index], next[target]] = [next[target], next[index]];
    onChangeAction(next);
  }

  function remove(key: string) {
    onChangeAction(sections.filter((section) => section.key !== key));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-900">Секції case study</h2>
        <AdminButton
          type="button"
          variant="outline"
          onClickAction={() => onChangeAction([...sections, createSectionDraft()])}
          startIcon={<Plus size={14} strokeWidth={1.75} />}
        >
          Додати секцію
        </AdminButton>
      </div>

      {sections.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
          Секцій немає. Сторінка case study покаже лише заголовок і зображення.
        </p>
      )}

      {sections.map((section, index) => (
        <div
          key={section.key}
          className="grid gap-4 rounded-xl border border-neutral-200 bg-white p-5 sm:grid-cols-2"
        >
          <div className="flex items-center justify-between sm:col-span-2">
            <span className="font-mono text-sm text-neutral-500">
              {String(index + 1).padStart(2, '0')}
            </span>

            <div className="flex gap-1.5">
              <AdminButton
                type="button"
                variant="icon"
                size="sm"
                aria-label="Вгору"
                disabled={index === 0}
                onClickAction={() => move(index, -1)}
              >
                <ArrowUp size={14} strokeWidth={1.75} />
              </AdminButton>
              <AdminButton
                type="button"
                variant="icon"
                size="sm"
                aria-label="Вниз"
                disabled={index === sections.length - 1}
                onClickAction={() => move(index, 1)}
              >
                <ArrowDown size={14} strokeWidth={1.75} />
              </AdminButton>
              <AdminButton
                type="button"
                variant="icon"
                tone="danger"
                size="sm"
                aria-label="Delete секцію"
                onClickAction={() => remove(section.key)}
              >
                <Trash2 size={14} strokeWidth={1.75} />
              </AdminButton>
            </div>
          </div>

          <label>
            <span className={labelStyles}>Заголовок (UA)</span>
            <AdminInput
              type="text"
              required
              value={section.titleUk}
              onChange={(event) => update(section.key, 'titleUk', event.target.value)}
            />
          </label>

          <label>
            <span className={labelStyles}>Заголовок (EN)</span>
            <AdminInput
              type="text"
              required
              value={section.titleEn}
              onChange={(event) => update(section.key, 'titleEn', event.target.value)}
            />
          </label>

          <label>
            <span className={labelStyles}>Абзац 1 (UA)</span>
            <AdminTextarea
              required
              rows={3}
              value={section.bodyUk}
              onChange={(event) => update(section.key, 'bodyUk', event.target.value)}
            />
          </label>

          <label>
            <span className={labelStyles}>Абзац 1 (EN)</span>
            <AdminTextarea
              required
              rows={3}
              value={section.bodyEn}
              onChange={(event) => update(section.key, 'bodyEn', event.target.value)}
            />
          </label>

          <label>
            <span className={labelStyles}>{"Абзац 2 (UA, необов'язково)"}</span>
            <AdminTextarea
              rows={3}
              value={section.body2Uk}
              onChange={(event) => update(section.key, 'body2Uk', event.target.value)}
            />
          </label>

          <label>
            <span className={labelStyles}>{"Абзац 2 (EN, необов'язково)"}</span>
            <AdminTextarea
              rows={3}
              value={section.body2En}
              onChange={(event) => update(section.key, 'body2En', event.target.value)}
            />
          </label>
        </div>
      ))}
    </div>
  );
}
