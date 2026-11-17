import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { ImageLightbox, type GalleryImage } from '@/components/ImageLightbox';
import { lightboxPhotos } from './lightbox-fixtures';

function Gallery({ photos = lightboxPhotos }: { photos?: GalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  return (
    <ImageLightbox
      photos={photos}
      activeIndex={activeIndex}
      onCloseAction={() => setActiveIndex(null)}
    >
      <div className="flex gap-4">
        {photos.map(({ photo }, index) => (
          <button key={photo.id} type="button" onClick={() => setActiveIndex(index)}>
            Open photo {index + 1}
          </button>
        ))}
      </div>
    </ImageLightbox>
  );
}

const meta = { title: 'UI/ImageLightbox', component: Gallery } satisfies Meta<typeof Gallery>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SinglePhoto: Story = {
  args: { photos: lightboxPhotos.slice(0, 1) },
};

export const TwoPhotos: Story = {};
