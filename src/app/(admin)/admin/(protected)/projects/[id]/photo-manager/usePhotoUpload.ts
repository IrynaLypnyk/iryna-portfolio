'use client';

import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { upload } from '@imagekit/javascript';
import { getProjectMediaValidationError } from '@/lib/media/project-media-policy';
import { toast } from 'sonner';

import type { PhotoRow, UploadItem } from './types';
import { apiRoutes } from '@/constants/routes';

type UploadApiResponse = {
  photo: PhotoRow;
  message?: string;
};

type Props = {
  projectId: string;
  onPhotoUploadedAction: (photo: PhotoRow) => void;
};

export function usePhotoUpload({ projectId, onPhotoUploadedAction }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  function handleFilePickerClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    // Reset so the same file can be re-selected after an error.
    event.target.value = '';

    if (files.length === 0) {
      return;
    }

    const validFiles = files.filter((file) => {
      const error = getProjectMediaValidationError(file.type, file.size);
      if (error) toast.error(`«${file.name}»: ${error}`);
      return !error;
    });

    if (validFiles.length === 0) {
      return;
    }

    const queue = createUploadQueue(validFiles);

    setUploadItems(queue);
    setIsUploading(true);

    // Sequential upload: one file at a time to avoid duplicate orderInProject.
    for (const item of queue) {
      updateUploadItem(item.uid, { status: 'uploading' });

      try {
        const authResponse = await fetch(apiRoutes.admin.projectPhotoUploadAuth(projectId));
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
          useUniqueFileName: false,
          overwriteFile: false,
        });

        if (!imageKitResult.fileId) {
          throw new Error('ImageKit did not return fileId');
        }

        const response = await fetch(apiRoutes.admin.projectPhotoUpload(projectId), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileId: imageKitResult.fileId,
          }),
        });

        const json = (await response.json()) as UploadApiResponse;

        if (!response.ok) {
          throw new Error(json.message ?? 'Не вдалося зберегти медіафайл');
        }

        onPhotoUploadedAction(json.photo);
        updateUploadItem(item.uid, { status: 'done' });
      } catch (error) {
        updateUploadItem(item.uid, {
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Не вдалося завантажити файл',
        });
      }
    }

    setIsUploading(false);
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
