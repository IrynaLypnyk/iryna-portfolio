'use client';

import { toast } from 'sonner';

import { IMAGE_MIME_TYPES, IMAGE_MAX_BYTES } from './image-policy';
export { IMAGE_FILE_ACCEPT } from './image-policy';

export function validateImageFiles(files: File[]): File[] {
  const validFiles: File[] = [];

  for (const file of files) {
    if (!IMAGE_MIME_TYPES.includes(file.type)) {
      toast.error(`«${file.name}»: непідтримуваний тип файлу (${file.type})`);
      continue;
    }

    if (file.size > IMAGE_MAX_BYTES) {
      toast.error(
        `«${file.name}»: файл занадто великий (${(file.size / 1024 / 1024).toFixed(
          1
        )} МБ, максимум 25 МБ)`
      );
      continue;
    }

    validFiles.push(file);
  }

  return validFiles;
}
