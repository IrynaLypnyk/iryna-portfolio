export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
];
export const IMAGE_MAX_BYTES = 25 * 1024 * 1024;
export const IMAGE_FILE_ACCEPT = IMAGE_MIME_TYPES.join(',');

export function getImageValidationError(mime: string, size: number): string | null {
  if (!IMAGE_MIME_TYPES.includes(mime)) return 'Непідтримуваний тип зображення';
  if (!Number.isFinite(size) || size <= 0) return 'Порожній або некоректний файл';
  if (size > IMAGE_MAX_BYTES) return 'Файл перевищує максимальний розмір 25 МБ';
  return null;
}
