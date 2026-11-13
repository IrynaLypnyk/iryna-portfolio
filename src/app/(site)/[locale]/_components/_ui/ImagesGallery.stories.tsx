import type { Meta, StoryObj } from '@storybook/nextjs';
import { ImagesGallery } from './ImagesGallery';
import { samplePhoto } from '@/storybook/fixtures';

const meta = {
  title: 'UI/ProjectGallery',
  component: ImagesGallery,
  args: {
    photos: [
      { ...samplePhoto, id: 'photo-1' },
      { ...samplePhoto, id: 'photo-2', description: 'Token editor with live contrast checks' },
      {
        ...samplePhoto,
        id: 'photo-3',
        description: 'Component docs, generated from source',
        linkUrl: 'https://storybook.example.com',
      },
    ],
  },
} satisfies Meta<typeof ImagesGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click a thumbnail to open it in the lightbox; a caption/link sits under any photo that has one. */
export const Default: Story = {};

/** A single photo uses the available width without leaving empty columns. */
export const SinglePhoto: Story = {
  args: { photos: [samplePhoto] },
};

const sampleVideo = {
  ...samplePhoto,
  id: 'video-1',
  src: 'https://ik.imagekit.io/demo/sample-video.mp4',
  mimeType: 'video/mp4',
  width: 1280,
  height: 720,
  alt: 'Video demo',
  description: 'Open to play the video',
};

export const MixedMedia: Story = {
  args: { photos: [samplePhoto, sampleVideo] },
};

export const SingleVideo: Story = {
  args: { photos: [sampleVideo] },
};

/** A larger collection with varied aspect ratios exercises the column layout. */
export const MultipleColumns: Story = {
  args: {
    photos: Array.from({ length: 8 }, (_, index) => ({
      ...samplePhoto,
      id: `photo-${index + 1}`,
      src: `${samplePhoto.src}&h=${index % 3 === 0 ? 1600 : 1000}&fit=crop`,
      height: index % 3 === 0 ? 1600 : 1000,
      description: index % 2 === 0 ? `Screenshot ${index + 1}` : null,
      linkUrl: index === 0 ? 'https://storybook.example.com' : null,
    })),
  },
};

export const NarrowContainer: Story = {
  ...MultipleColumns,
  decorators: [
    (Story) => (
      <div className="w-full max-w-80">
        <Story />
      </div>
    ),
  ],
};

export const Empty: Story = {
  args: { photos: [] },
};
