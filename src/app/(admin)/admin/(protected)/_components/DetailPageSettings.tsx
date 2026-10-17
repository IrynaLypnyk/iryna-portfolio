'use client';
import { DetailPageStatus } from '@/generated/prisma/enums';
import { AdminSelect } from './AdminSelect';

export function DetailPageSettings({
  value,
  onChangeAction,
  disabled,
}: {
  value: DetailPageStatus;
  onChangeAction: (value: DetailPageStatus) => void;
  disabled: boolean;
}) {
  return (
    <section className="space-y-3 rounded-sm border border-neutral-200 bg-white p-5">
      <h2 className="text-base font-semibold text-neutral-900">Detail page</h2>
      <label className="block max-w-md space-y-1">
        <span className="block text-xs font-semibold tracking-wider text-neutral-600 uppercase">
          Detail page status (optional)
        </span>
        <AdminSelect
          name="detailPageStatus"
          value={value}
          disabled={disabled}
          onChange={(event) => onChangeAction(event.target.value as DetailPageStatus)}
        >
          <option value={DetailPageStatus.NONE}>NONE — No dedicated detail page</option>
          <option value={DetailPageStatus.DRAFT}>DRAFT — Preparing content</option>
          <option value={DetailPageStatus.PUBLISHED}>
            PUBLISHED — Public when new detail pages launch
          </option>
        </AdminSelect>
      </label>
      <p className="text-sm text-neutral-600">
        New content blocks stay private until the new detail pages are available. This setting is
        separate from lifecycle status and the Published listing toggle. Existing public pages keep
        their current behaviour during the transition.
      </p>
    </section>
  );
}
