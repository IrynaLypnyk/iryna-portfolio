'use client';
import type { Dispatch, SetStateAction } from 'react';
import type { OwnerMediaDraft } from '@/lib/media/owner-media-draft';
import { MediaEditor } from './MediaEditor';

/** Stage 3 integration: existing block media only; block authoring is Stage 4. */
export function OwnerMediaFields({
  ownerId,
  ownerType,
  media,
  onChangeAction,
  onUploadingChangeAction,
  disabled,
}: {
  ownerId: string;
  ownerType: 'projects' | 'experiments';
  media: OwnerMediaDraft;
  onChangeAction: Dispatch<SetStateAction<OwnerMediaDraft>>;
  onUploadingChangeAction: (busy: boolean) => void;
  disabled: boolean;
}) {
  const shared = { ownerId, ownerType, onUploadingChangeAction, disabled };
  return (
    <div className="min-w-0 space-y-6">
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
      {media.contentBlocks.map((block, index) => (
        <div key={block.key} className="space-y-2">
          <h3 className="text-sm font-semibold">
            Block {index + 1}
            {block.titleEn ? ` · ${block.titleEn}` : ''}
          </h3>
          <MediaEditor
            {...shared}
            context="block"
            items={block.photos}
            onChangeAction={(update) =>
              onChangeAction((current) => ({
                ...current,
                contentBlocks: current.contentBlocks.map((item) =>
                  item.key !== block.key
                    ? item
                    : {
                        ...item,
                        photos: typeof update === 'function' ? update(item.photos) : update,
                      }
                ),
              }))
            }
          />
        </div>
      ))}
    </div>
  );
}
