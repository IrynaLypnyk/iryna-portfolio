import type { Meta, StoryObj } from '@storybook/nextjs';
import { AccentButton } from './AccentButton';

const meta = {
  title: 'UI/AccentButton',
  component: AccentButton,
  args: {
    children: 'Send message',
  },
} satisfies Meta<typeof AccentButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};

export const LongLabel: Story = {
  render: () => (
    <div className="max-w-50">
      <AccentButton>Download the full case study as a PDF</AccentButton>
    </div>
  ),
};
