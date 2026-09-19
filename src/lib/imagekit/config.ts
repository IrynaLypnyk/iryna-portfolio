export const IMAGEKIT_ROOT_FOLDER = process.env.IMAGEKIT_ROOT_FOLDER ?? '';

if (!IMAGEKIT_ROOT_FOLDER) {
  throw new Error('IMAGEKIT_ROOT_FOLDER is not set');
}
