import type { Meta, StoryObj } from '@storybook/nextjs';
import { FormLabel } from './FormLabel';

const meta = {
  title: 'UI/Form/FormLabel',
  component: FormLabel,
  args: { children: 'Your name' },
} satisfies Meta<typeof FormLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Required: Story = {
  args: { required: true },
};

export const Long: Story = {
  args: { children: 'What would you like to build together' },
};
