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
        <>
          <CoverSelector {...shared} media={media} onChangeAction={onChangeAction} />
          <div className="space-y-4">
            <label className="flex items-start gap-3 text-sm text-neutral-800">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0"
                checked={media.useSameCover ?? true}
                disabled={disabled}
                onChange={(event) =>
                  onChangeAction((current) => ({ ...current, useSameCover: event.target.checked }))
                }
              />
              Use the same cover on the case study page
            </label>
            {media.useSameCover === false && (
              <CoverSelector {...shared} detail media={media} onChangeAction={onChangeAction} />
            )}
          </div>
        </>
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
