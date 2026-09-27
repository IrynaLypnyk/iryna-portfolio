import type { Meta, StoryObj } from '@storybook/nextjs';
import { AppInput } from './AppInput';

const meta = {
  title: 'UI/Form/AppInput',
  component: AppInput,
  argTypes: {
    type: { control: 'inline-radio', options: ['text', 'email', 'tel', 'url', 'password'] },
  },
} satisfies Meta<typeof AppInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPlaceholder: Story = {
  args: { type: 'email', placeholder: 'jane@example.com', autoComplete: 'email' },
};

export const WithValue: Story = {
  args: { defaultValue: 'Iryna Lypnyk' },
};

export const WithLabel: Story = {
  args: {
    label: 'Email',
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Cannot edit' },
};

export const WithError: Story = {
  args: {
    disabled: false,
    defaultValue: 'Some email',
    errorMessage: 'Please enter a valid email address.',
  },
};
