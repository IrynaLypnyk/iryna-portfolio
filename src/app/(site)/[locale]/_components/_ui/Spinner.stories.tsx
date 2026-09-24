import type { Meta, StoryObj } from '@storybook/nextjs';

import { Spinner } from './Spinner';

const meta = {
  title: 'UI/Spinner',
  component: Spinner,
  decorators: [
    (Story, context) => (
      <div className={context.args.color === 'white' ? 'bg-app-accent-bright p-6' : 'p-6'}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
  args: {
    size: 20,
  },
};

export const White: Story = {
  args: {
    color: 'white',
  },
};
