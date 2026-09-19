import 'server-only';

export function getImageUrl(src: string): string {
  const baseUrl = process.env.IMAGEKIT_URL_ENDPOINT;

  if (!baseUrl) {
    throw new Error('IMAGEKIT_URL_ENDPOINT is not set');
  }

  return `${baseUrl}${src}`;
}
