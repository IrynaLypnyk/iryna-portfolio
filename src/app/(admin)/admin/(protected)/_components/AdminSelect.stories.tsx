import type { Meta, StoryObj } from '@storybook/nextjs';

import { AdminSelect } from './AdminSelect';

const meta: Meta<typeof AdminSelect> = {
  title: 'Admin/AdminSelect',
  component: AdminSelect,
  args: {
    value: 'apartment',
    onChange: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof AdminSelect>;

export const Default: Story = {
  render: (args) => (
    <AdminSelect {...args}>
      <option value="">— Не вибрано —</option>
      <option value="apartment">Квартира</option>
      <option value="house">Будинок</option>
      <option value="commercial">Комерційний простір</option>
    </AdminSelect>
  ),
};

export const Empty: Story = {
  args: {
    value: '',
  },
  render: (args) => (
    <AdminSelect {...args}>
      <option value="">— Не вибрано —</option>
      <option value="apartment">Квартира</option>
      <option value="house">Будинок</option>
    </AdminSelect>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => (
    <AdminSelect {...args}>
      <option value="apartment">Квартира</option>
      <option value="house">Будинок</option>
    </AdminSelect>
  ),
};
