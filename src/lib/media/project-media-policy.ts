import { IMAGE_FILE_ACCEPT, getImageValidationError } from './image-policy';

export const VIDEO_MIME_TYPES = ['video/mp4', 'video/webm'];
export const VIDEO_MAX_BYTES = 100 * 1024 * 1024;
export const PROJECT_MEDIA_ACCEPT = [IMAGE_FILE_ACCEPT, ...VIDEO_MIME_TYPES].join(',');

export function isVideo(mimeType?: string | null): boolean {
  return !!mimeType?.startsWith('video/');
}

export function getProjectMediaValidationError(mime: string, size: number): string | null {
  if (!isVideo(mime)) return getImageValidationError(mime, size);
  if (!VIDEO_MIME_TYPES.includes(mime)) return 'Підтримуються лише відео MP4 та WebM';
  if (!Number.isFinite(size) || size <= 0) return 'Порожній або некоректний файл';
  if (size > VIDEO_MAX_BYTES) return 'Відео перевищує максимальний розмір 100 МБ';
  return null;
}
