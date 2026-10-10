'use client';

import { ProjectStack } from '@/app/(site)/[locale]/_components/_layouts/ProjectArticle/ProjectStack';
import { AdminInput } from '@/app/(admin)/admin/(protected)/_components/AdminInput';
import { ChangeEvent } from 'react';

type Props = {
  value: string;
  onChangeAction: (value: string) => void;
};

export function StackInput({ value, onChangeAction }: Props) {
  const items = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="space-y-3">
      <AdminInput
        type="text"
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChangeAction(event.target.value)}
        placeholder="React, TypeScript, Redux"
      />
      {items.length > 0 && (
        <div className="text-sm text-neutral-600">
          Preview:{' '}
          <span className="font-medium">
            <ProjectStack items={items} />
          </span>
        </div>
      )}
    </div>
  );
}
