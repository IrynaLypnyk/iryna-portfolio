import type { Meta, StoryObj } from '@storybook/nextjs';
import { ProjectFeatures } from './ProjectFeatures';
import { featuredProject } from '@/storybook/fixtures';

const meta = {
  title: 'UI/ProjectFeatures',
  component: ProjectFeatures,
  args: { features: featuredProject.features },
} satisfies Meta<typeof ProjectFeatures>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleColumn: Story = {
  args: { features: featuredProject.features.slice(0, 1) },
};
