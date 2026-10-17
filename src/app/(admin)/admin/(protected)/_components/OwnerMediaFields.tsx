'use client';
import type { Dispatch, SetStateAction } from 'react';
import type { OwnerMediaDraft } from '@/lib/media/owner-media-draft';
import { MediaEditor } from './MediaEditor';
import { ContentBlocksEditor } from './ContentBlocksEditor';
import { CoverSelector } from './CoverSelector';

/** One draft shared by content blocks, Additional Media and independent covers. */
export function OwnerMediaFields({
  view,
  ownerId,
  ownerType,
  media,
  onChangeAction,
  onUploadingChangeAction,
  disabled,
}: {
  view: 'content' | 'media';
  ownerId?: string;
  ownerType: 'projects' | 'experiments';
  media: OwnerMediaDraft;
  onChangeAction: Dispatch<SetStateAction<OwnerMediaDraft>>;
  onUploadingChangeAction: (busy: boolean) => void;
  disabled: boolean;
}) {
  const shared = { ownerId, ownerType, onUploadingChangeAction, disabled };
  return (
    <div className="min-w-0 space-y-8">
      {view === 'media' && (
        <CoverSelector {...shared} media={media} onChangeAction={onChangeAction} />
      )}
      {view === 'content' && (
        <ContentBlocksEditor
          {...shared}
          blocks={media.contentBlocks}
          onChangeAction={(update) =>
            onChangeAction((current) => ({
              ...current,
              contentBlocks: typeof update === 'function' ? update(current.contentBlocks) : update,
            }))
          }
        />
      )}
      {view === 'media' && (
        <MediaEditor
          {...shared}
          context="additional"
          items={media.additionalMedia}
          onChangeAction={(update) =>
            onChangeAction((current) => ({
              ...current,
              additionalMedia:
                typeof update === 'function' ? update(current.additionalMedia) : update,
            }))
          }
        />
      )}
    </div>
  );
}
