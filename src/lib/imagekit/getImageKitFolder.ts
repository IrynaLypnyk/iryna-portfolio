// src/lib/imagekit/getImageKitFolder.ts

import { IMAGEKIT_ROOT_FOLDER } from './config';

type ImageKitFolderType = 'projects' | 'blog' | 'team';

export function getImageKitFolder(type: ImageKitFolderType, ...segments: string[]) {
  return [IMAGEKIT_ROOT_FOLDER, type, ...segments].filter(Boolean).join('/').replace(/\/+/g, '/');
}
