'use client';
import { useCallback, useState } from 'react';
import {
  mediaSnapshot,
  reconcileOwnerMedia,
  type OwnerMediaDraft,
  type SavedOwnerMedia,
} from '@/lib/media/owner-media-draft';

export function useOwnerMediaDraft(initial?: OwnerMediaDraft) {
  const [media, setMedia] = useState<OwnerMediaDraft>(
    () => initial ?? { additionalMedia: [], contentBlocks: [] }
  );
  const [savedSnapshot, setSavedSnapshot] = useState(() => mediaSnapshot(media));
  const [uploadCount, setUploadCount] = useState(0);
  const onUploadingChange = useCallback(
    (busy: boolean) => setUploadCount((count) => Math.max(0, count + (busy ? 1 : -1))),
    []
  );
  function markSaved(saved: SavedOwnerMedia, submitted: OwnerMediaDraft) {
    setSavedSnapshot(mediaSnapshot(submitted));
    setMedia((current) => reconcileOwnerMedia(current, submitted, saved));
  }
  return {
    media,
    setMedia,
    isDirty: mediaSnapshot(media) !== savedSnapshot,
    isUploading: uploadCount > 0,
    onUploadingChange,
    markSaved,
  };
}
