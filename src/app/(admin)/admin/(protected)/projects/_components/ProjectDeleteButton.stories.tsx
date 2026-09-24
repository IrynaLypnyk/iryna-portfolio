import type { Meta, StoryObj } from '@storybook/nextjs';

import { ProjectDeleteButton } from './ProjectDeleteButton';

const meta: Meta<typeof ProjectDeleteButton> = {
  title: 'Admin/DeleteActions/ProjectDeleteButton',
  component: ProjectDeleteButton,
  tags: ['autodocs'],
  parameters: {
    backgrounds: { default: 'light' },
  },
  args: {
    id: 'project-1',
    title: 'Alter Ego',
  },
};

export default meta;
type Story = StoryObj<typeof ProjectDeleteButton>;

export const Default: Story = {};
