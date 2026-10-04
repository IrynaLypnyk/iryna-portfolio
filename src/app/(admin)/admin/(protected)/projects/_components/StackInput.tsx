'use client';

import { AdminInput } from '@/app/(admin)/admin/(protected)/_components/AdminInput';

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function StackInput({ value, onChange }: Props) {
  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const previewText = items.join(' · ');

  return (
    <div className="space-y-3">
      <AdminInput
        type="text"
        value={value}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
        placeholder="React, TypeScript, Redux"
      />
      {previewText && (
        <div className="text-sm text-neutral-600">
          Preview: <span className="font-medium">{previewText}</span>
        </div>
      )}
    </div>
  );
}
