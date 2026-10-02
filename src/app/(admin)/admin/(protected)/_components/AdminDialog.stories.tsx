import type { Meta, StoryObj } from '@storybook/nextjs';

import { AdminButton } from '@/app/(admin)/admin/_components/AdminButton';
import { AdminDialog } from './AdminDialog';

const meta: Meta<typeof AdminDialog> = {
  title: 'Admin/Dialogs/AdminDialog',
  component: AdminDialog,
  args: {
    title: 'Назва діалогу',
    description: 'Короткий опис або контекст дії.',
    onCloseAction: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof AdminDialog>;

export const Default: Story = {
  render: (args) => (
    <AdminDialog
      {...args}
      actions={
        <div className="flex justify-end gap-2">
          <AdminButton variant="ghost" size="sm" onClickAction={() => {}}>
            Скасувати
          </AdminButton>
          <AdminButton size="sm" onClickAction={() => {}}>
            Підтвердити
          </AdminButton>
        </div>
      }
    >
      <p className="text-sm text-neutral-600">Простий вміст діалогу.</p>
    </AdminDialog>
  ),
};

export const CloseDisabled: Story = {
  args: {
    title: 'Збереження…',
    description: 'Дочекайтеся завершення операції.',
    closeDisabled: true,
  },
  render: (args) => (
    <AdminDialog {...args}>
      <p className="text-sm text-neutral-600">Кнопка закриття вимкнена.</p>
    </AdminDialog>
  ),
};
