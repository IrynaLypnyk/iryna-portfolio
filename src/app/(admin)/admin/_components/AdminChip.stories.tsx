import type { Meta, StoryObj } from '@storybook/nextjs';
import { useArgs } from 'storybook/preview-api';
import { fn } from 'storybook/test';
import { AdminChip } from './AdminChip';

const meta = {
  title: 'Admin/AdminChip',
  component: AdminChip,
  args: {
    label: 'Обраний проєкт',
    checked: false,
    disabled: false,
    onChangeAction: fn(),
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs();

    return (
      <AdminChip
        {...args}
        onChangeAction={(checked) => {
          args.onChangeAction(checked);
          updateArgs({ checked });
        }}
      />
    );
  },
} satisfies Meta<typeof AdminChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Checked: Story = { args: { checked: true } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledChecked: Story = { args: { checked: true, disabled: true } };
export const LongLabel: Story = {
  args: { label: 'Показувати цей проєкт на головній сторінці' },
};
