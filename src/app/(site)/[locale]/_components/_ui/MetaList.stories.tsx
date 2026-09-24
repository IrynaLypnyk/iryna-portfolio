import type { Meta, StoryObj } from '@storybook/nextjs';
import { MetaList } from './MetaList';
import { TextLink } from './TextLink';

const meta = {
  title: 'UI/MetaList',
  component: MetaList,
  args: {
    items: [
      { label: 'Role', value: 'Lead frontend engineer' },
      { label: 'Stack', value: 'Next.js · TypeScript · Tailwind' },
      { label: 'Status', value: 'Live' },
    ],
  },
} satisfies Meta<typeof MetaList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Compact: Story = {
  args: { variant: 'compact' },
};

export const Roomy: Story = {
  args: { variant: 'roomy' },
};

export const Panel: Story = {
  args: { variant: 'panel', labelColor: 'blue' },
};

export const WithCustomLabelWidth: Story = {
  args: { variant: 'roomy', labelWidth: 150 },
};
