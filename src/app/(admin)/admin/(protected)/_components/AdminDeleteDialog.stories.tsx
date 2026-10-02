import type { Meta, StoryObj } from '@storybook/nextjs';

import { AdminDeleteDialog } from './AdminDeleteDialog';

const meta: Meta<typeof AdminDeleteDialog> = {
  title: 'Admin/Dialogs/AdminDeleteDialog',
  component: AdminDeleteDialog,
  args: {
    title: 'Видалити запис?',
    description: 'Цю дію неможливо скасувати.',
    isDeleting: false,
    onConfirmAction: () => {},
    onCancelAction: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof AdminDeleteDialog>;

export const Default: Story = {
  render: (args) => (
    <AdminDeleteDialog {...args}>
      <p className="text-sm text-neutral-600">Додатковий вміст необовʼязковий.</p>
    </AdminDeleteDialog>
  ),
};

export const Deleting: Story = {
  args: {
    isDeleting: true,
  },
};
