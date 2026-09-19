import { IMAGEKIT_ROOT_FOLDER } from './config';

export function assertSafeImageKitPath(filePath: string) {
  if (!IMAGEKIT_ROOT_FOLDER) {
    throw new Error('IMAGEKIT_ROOT_FOLDER is not configured. Refusing ImageKit operation.');
  }

  const rootFolder = IMAGEKIT_ROOT_FOLDER.replace(/\/+$/, '');

  if (filePath !== rootFolder && !filePath.startsWith(`${rootFolder}/`)) {
    throw new Error(`Unsafe ImageKit operation: "${filePath}" is outside "${rootFolder}"`);
  }
}
