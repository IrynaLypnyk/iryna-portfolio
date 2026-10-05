'use client';

import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { AdminButton } from '@/app/(admin)/admin/_components/AdminButton';
import { AdminInput } from '@/app/(admin)/admin/(protected)/_components/AdminInput';

export type FeatureDraft = {
  /** Stable key for React only — never sent to the API. */
  key: string;
  uk: string;
  en: string;
};

export function createFeatureDraft(): FeatureDraft {
  return { key: crypto.randomUUID(), uk: '', en: '' };
}

const labelStyles = 'mb-1 block text-xs font-semibold tracking-wider text-neutral-500 uppercase';

type Props = {
  features: FeatureDraft[];
  onChangeAction: (features: FeatureDraft[]) => void;
};

/**
 * Editor for a project's "Key features" bullet list.
 *
 * UA and EN copy are added and reordered together — one row is one bullet in
 * both languages — so a single "add" button appends a paired draft instead of
 * the two locales drifting out of sync with separate lists.
 */
export function FeaturesEditor({ features, onChangeAction }: Props) {
  function update(key: string, field: 'uk' | 'en', value: string) {
    onChangeAction(
      features.map((feature) => (feature.key === key ? { ...feature, [field]: value } : feature))
    );
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;

    if (target < 0 || target >= features.length) {
      return;
    }

    const next = features.slice();
    [next[index], next[target]] = [next[target], next[index]];
    onChangeAction(next);
  }

  function remove(key: string) {
    onChangeAction(features.filter((feature) => feature.key !== key));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-neutral-900">Key features</h3>
        <AdminButton
          type="button"
          variant="outline"
          onClickAction={() => onChangeAction([...features, createFeatureDraft()])}
          startIcon={<Plus size={14} strokeWidth={1.75} />}
        >
          Add feature
        </AdminButton>
      </div>

      {features.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
          No features. Section &quot;Key features&quot; on project card will not be shown.
        </p>
      )}

      {features.map((feature, index) => (
        <div
          key={feature.key}
          className="grid gap-3 rounded-xl border border-neutral-200 bg-white p-4 sm:grid-cols-[1fr_1fr_auto]"
        >
          <label>
            <span className={labelStyles}>UA</span>
            <AdminInput
              type="text"
              required
              value={feature.uk}
              onChange={(event) => update(feature.key, 'uk', event.target.value)}
            />
          </label>

          <label>
            <span className={labelStyles}>EN</span>
            <AdminInput
              type="text"
              required
              value={feature.en}
              onChange={(event) => update(feature.key, 'en', event.target.value)}
            />
          </label>

          <div className="flex items-end gap-1.5">
            <AdminButton
              type="button"
              variant="icon"
              size="sm"
              aria-label="Up"
              disabled={index === 0}
              onClickAction={() => move(index, -1)}
            >
              <ArrowUp size={14} strokeWidth={1.75} />
            </AdminButton>
            <AdminButton
              type="button"
              variant="icon"
              size="sm"
              aria-label="Down"
              disabled={index === features.length - 1}
              onClickAction={() => move(index, 1)}
            >
              <ArrowDown size={14} strokeWidth={1.75} />
            </AdminButton>
            <AdminButton
              type="button"
              variant="icon"
              tone="danger"
              size="sm"
              aria-label="Delete"
              onClickAction={() => remove(feature.key)}
            >
              <Trash2 size={14} strokeWidth={1.75} />
            </AdminButton>
          </div>
        </div>
      ))}
    </div>
  );
}
