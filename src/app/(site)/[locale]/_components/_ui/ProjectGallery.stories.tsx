import type { Meta, StoryObj } from '@storybook/nextjs';
import { ProjectGallery } from './ProjectGallery';
import { samplePhoto } from '@/storybook/fixtures';

const meta = {
  title: 'UI/ProjectGallery',
  component: ProjectGallery,
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
} satisfies Meta<typeof ProjectGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click a thumbnail to open it in the lightbox; a caption/link sits under any photo that has one. */
export const Default: Story = {};

/** A single photo hides the prev/next controls — nothing to swipe between. */
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
