import type { GalleryImage } from '@/components/ImageLightbox';
import type { Photo } from '@/types/projects';

const caseStudyImage: Photo<string> = {
  id: 'first-image',
  src: '/storybook/case-study-screen.svg',
  mimeType: 'image/svg+xml',
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
      src: '/storybook/logo.png',
      width: 160,
      height: 90,
      alt: 'Second gallery image',
    },
    caption: {
      title: 'KITCHEN — a longer caption that wraps on small screens',
      subtitle: 'Alter Ego — interior design studio project',
    },
  },
];
