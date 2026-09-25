'use client';

import { useState } from 'react';
import { CoverImageUploader, type CoverImage } from './CoverImageUploader';

type Props = {
  experimentId: string;
  initialCover: CoverImage | null;
};

export function ExperimentCoverSection({ experimentId, initialCover }: Props) {
  const [cover, setCover] = useState<CoverImage | null>(initialCover);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <h2 className="mb-4 text-xl font-semibold text-neutral-900">Обкладинка</h2>
      <CoverImageUploader
        experimentId={experimentId}
        cover={cover}
        onCoverChangeAction={setCover}
      />
    </div>
  );
}
