import type { Meta, StoryObj } from '@storybook/nextjs';
import { routes } from '@/constants/routes';
import { EditButton } from './EditButton';

const meta: Meta<typeof EditButton> = {
  title: 'Admin/EditButton',
  component: EditButton,
};

export default meta;
type Story = StoryObj<typeof EditButton>;

export const Default: Story = {};

export const Medium: Story = {
  args: { size: 'md' },
};

export const AsLink: Story = {
  args: { href: routes.admin.project('example') },
};

export const Disabled: Story = {
  args: { disabled: true },
};
