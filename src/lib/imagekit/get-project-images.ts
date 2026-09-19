import { getImageKit } from './client';
import { getImageKitFolder } from '@/lib/imagekit/getImageKitFolder';

export type ImageKitProjectImage = {
  type: 'file';
  fileId: string;
  name: string;
  filePath: string;
  url: string;
  width: number;
  height: number;
  customMetadata?: Record<string, unknown> | null;
};

function isImageKitProjectImage(asset: unknown): asset is ImageKitProjectImage {
  if (typeof asset !== 'object' || asset === null) {
    return false;
  }

  return (
    'type' in asset &&
    asset.type === 'file' &&
    'fileId' in asset &&
    typeof asset.fileId === 'string' &&
    'name' in asset &&
    typeof asset.name === 'string' &&
    'filePath' in asset &&
    typeof asset.filePath === 'string' &&
    'url' in asset &&
    typeof asset.url === 'string' &&
    'width' in asset &&
    typeof asset.width === 'number' &&
    'height' in asset &&
    typeof asset.height === 'number'
  );
}

export async function getProjectImages(projectSlug: string): Promise<ImageKitProjectImage[]> {
  const imageKit = getImageKit();

  const projectPath = getImageKitFolder('projects', projectSlug, 'photos');

  // Runtime-перевірка виконується через isImageKitProjectImage.
  // Assertion потрібен через неточні типи SDK: File | Folder.
  const assets = await imageKit.assets.list({
    type: 'file',
    fileType: 'image',
    searchQuery: `path:"${projectPath}"`,
    limit: 1000,
  });

  const imageAssets = assets.filter(isImageKitProjectImage) as ImageKitProjectImage[];

  const freshImages: ImageKitProjectImage[] = [];

  for (const asset of imageAssets) {
    try {
      const details = await imageKit.files.get(asset.fileId);

      freshImages.push({
        ...asset,
        customMetadata: details.customMetadata ?? null,
      });
    } catch {
      console.warn('Skipping unavailable ImageKit file:', {
        fileId: asset.fileId,
        filePath: asset.filePath,
      });
    }
  }

  return freshImages;
}
