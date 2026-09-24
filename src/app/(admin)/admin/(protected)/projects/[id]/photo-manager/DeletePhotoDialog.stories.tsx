import type { Meta, StoryObj } from '@storybook/nextjs';

import { DeletePhotoDialog } from './DeletePhotoDialog';
import type { EditablePhoto } from './types';

const photo: EditablePhoto = {
  id: 'photo-1',
  imageUrl: '/storybook/logo.png',
  width: 1600,
  height: 1067,
  orderInProject: 1,
  isProjectCover: false,
  captionUk: null,
  captionEn: null,
  draft: {
    orderInProject: 1,
    isProjectCover: false,
    captionUk: null,
    captionEn: null,
  },
};

const meta: Meta<typeof DeletePhotoDialog> = {
  title: 'Admin/Dialogs/DeletePhotoDialog',
  component: DeletePhotoDialog,
  tags: ['autodocs'],
  parameters: {
    backgrounds: { default: 'light' },
    layout: 'fullscreen',
  },
  args: {
    photo,
    onConfirmAction: () => {},
    onCancelAction: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof DeletePhotoDialog>;

export const Default: Story = {};
