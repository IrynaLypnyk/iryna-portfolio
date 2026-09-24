import type { Meta, StoryObj } from '@storybook/nextjs';
import { ErrorMessage } from './ErrorMessage';

const meta = {
  title: 'UI/Form/ErrorMessage',
  component: ErrorMessage,
  args: { message: 'Please enter a valid email address.' },
} satisfies Meta<typeof ErrorMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
