import type { Meta, StoryObj } from '@storybook/nextjs';

import { ConfirmReorderExitDialog } from './ConfirmReorderExitDialog';

const meta: Meta<typeof ConfirmReorderExitDialog> = {
  title: 'Admin/Dialogs/ConfirmReorderExitDialog',
  component: ConfirmReorderExitDialog,
  tags: ['autodocs'],
  parameters: {
    backgrounds: { default: 'light' },
    layout: 'fullscreen',
  },
  args: {
    isSaving: false,
    onSaveAndExitAction: () => {},
    onExitWithoutSavingAction: () => {},
    onCancelAction: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof ConfirmReorderExitDialog>;

export const Default: Story = {};

export const Saving: Story = {
  args: {
    isSaving: true,
  },
};
