import type { GalleryImage } from '@/components/ImageLightbox';
import type { Photo } from '@/types/projects';

const caseStudyImage: Photo<string> = {
  id: 'first-image',
  src: '/storybook/pattern-photo.png',
  mimeType: 'image/png',
  width: 1200,
  height: 800,
  alt: 'First gallery image',
  description: null,
  linkUrl: null,
};

export const lightboxPhotos: GalleryImage[] = [
  { photo: caseStudyImage, caption: { title: 'BATHROOM', subtitle: 'Alter Ego' } },
  {
    photo: {
      ...caseStudyImage,
      id: 'second-image',
      src: '/storybook/pattern-grid.png',
      mimeType: 'image/png',
      width: 1280,
      height: 720,
      alt: 'Second gallery image',
    },
    caption: {
      title: 'KITCHEN — a longer caption that wraps on small screens',
      subtitle: 'Alter Ego — interior design studio project',
    },
  },
];
