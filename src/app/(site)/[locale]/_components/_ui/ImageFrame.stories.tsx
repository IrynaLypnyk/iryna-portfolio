import type { Meta, StoryObj } from '@storybook/nextjs';
import { ImageFrame } from './ImageFrame';
import { samplePhoto } from '@/storybook/fixtures';

const meta = {
  title: 'UI/ImageFrame',
  component: ImageFrame,
  args: { photo: samplePhoto, className: 'max-w-md' },
} satisfies Meta<typeof ImageFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The 16:10 frame every project block uses. */
export const WithCover: Story = {};

/**
 * A project is publishable before its screenshot is uploaded, so the empty
 * frame holds the same space and names what is missing.
 */
export const EmptyWithDefaultPlaceholder: Story = {
  args: { photo: null },
};

export const EmptyWithCustomPlaceholder: Story = {
  args: { photo: null, placeholder: 'Project "Portfolio" — cover coming soon' },
};

/** No photo and no placeholder: a bare shell that still reserves the space. */
export const EmptyWithoutPlaceholder: Story = {
  args: { photo: null, placeholder: null },
};
