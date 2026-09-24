import type { Meta, StoryObj } from '@storybook/nextjs';
import { AppTextarea } from './AppTextarea';

const meta = {
  title: 'UI/Form/AppTextarea',
  component: AppTextarea,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: { rows: 4, placeholder: 'Tell me about the project…' },
  argTypes: {
    disabled: { control: 'boolean' },
    rows: { control: { type: 'range', min: 2, max: 12, step: 1 } },
  },
  decorators: [
    (Story) => (
      <div className="flex max-w-md flex-col">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AppTextarea>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `resize-y` only — horizontal resizing would break the form grid. */
export const Default: Story = {};

export const WithValue: Story = {
  args: {
    defaultValue:
      'We are rebuilding our marketing site and need someone who can own the front end end to end.',
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Sending…' },
};
