'use client';

import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { upload } from '@imagekit/javascript';
import { getProjectMediaValidationError } from '@/lib/media/project-media-policy';
import { getImageValidationError } from '@/lib/media/image-policy';
import { toast } from 'sonner';

import type { UploadItem } from './types';
import type { MediaAssetPreview } from '@/lib/media/media-draft';
import { apiRoutes } from '@/constants/routes';

type UploadApiResponse = {
  asset: MediaAssetPreview;
  message?: string;
};

type Props = {
  projectId: string;
  ownerType?: 'projects' | 'experiments';
  onAssetUploadedAction: (asset: MediaAssetPreview) => void;
  onUploadingChangeAction: (uploading: boolean) => void;
  multiple?: boolean;
  imagesOnly?: boolean;
};

export function usePhotoUpload({
  projectId,
  ownerType = 'projects',
  onAssetUploadedAction,
  onUploadingChangeAction,
  multiple = true,
  imagesOnly = false,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const busyRef = useRef(false);

  function handleFilePickerClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    const files = multiple ? selected : selected.slice(0, 1);

    // Reset so the same file can be re-selected after an error.
    event.target.value = '';

    if (files.length === 0 || busyRef.current) {
      return;
    }

    const validFiles = files.filter((file) => {
      const error = imagesOnly
        ? getImageValidationError(file.type, file.size)
        : getProjectMediaValidationError(file.type, file.size);
      if (error) toast.error(`«${file.name}»: ${error}`);
      return !error;
    });

    if (validFiles.length === 0) {
      return;
    }

    const queue = createUploadQueue(validFiles);

    setUploadItems(queue);
    setIsUploading(true);
    busyRef.current = true;
    onUploadingChangeAction(true);

    // Sequential uploads keep progress and errors readable. No Photo is saved here.
    for (const item of queue) {
      updateUploadItem(item.uid, { status: 'uploading' });

      try {
        const authResponse = await fetch(
          ownerType === 'projects'
            ? apiRoutes.admin.projectPhotoUploadAuth(projectId)
            : apiRoutes.admin.experimentPhotoUploadAuth(projectId)
        );
        const authJson = await authResponse.json();

        if (!authResponse.ok) {
          throw new Error(authJson.message ?? 'Failed to get upload parameters');
        }

        const imageKitResult = await upload({
          file: item.file,
          fileName: item.file.name,
          token: authJson.token,
          signature: authJson.signature,
          expire: authJson.expire,
          publicKey: authJson.publicKey,
          folder: authJson.folder,
          useUniqueFileName: true,
          overwriteFile: false,
          onProgress: (event) =>
            updateUploadItem(item.uid, {
              progress: event.total ? Math.round((event.loaded / event.total) * 100) : 0,
            }),
        });

        if (!imageKitResult.fileId) {
          throw new Error('ImageKit did not return fileId');
        }

        const response = await fetch(
          ownerType === 'projects'
            ? apiRoutes.admin.projectPhotoUpload(projectId)
            : apiRoutes.admin.experimentPhotoUpload(projectId),
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileId: imageKitResult.fileId,
            }),
          }
        );

        const json = (await response.json()) as UploadApiResponse;

        if (!response.ok) {
          throw new Error(json.message ?? 'Не вдалося зберегти медіафайл');
        }

        if (!json.asset?.id) throw new Error('The server did not register the asset.');
        onAssetUploadedAction(json.asset);
        updateUploadItem(item.uid, { status: 'done' });
      } catch (error) {
        updateUploadItem(item.uid, {
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Не вдалося завантажити файл',
        });
      }
    }

    setIsUploading(false);
    busyRef.current = false;
    onUploadingChangeAction(false);
  }

  function dismissUploadStatus() {
    setUploadItems([]);
  }

  function updateUploadItem(uid: string, patch: Partial<UploadItem>) {
    setUploadItems((current) =>
      current.map((item) => (item.uid === uid ? { ...item, ...patch } : item))
    );
  }

  return {
    fileInputRef,
    uploadItems,
    isUploading,
    handleFilePickerClick,
    handleFileChange,
    dismissUploadStatus,
  };
}

function createUploadQueue(files: File[]): UploadItem[] {
  return files.map((file) => ({
    uid: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
    fileName: file.name,
    file,
    status: 'queued',
  }));
}
