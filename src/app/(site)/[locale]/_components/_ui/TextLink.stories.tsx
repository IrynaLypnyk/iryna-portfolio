import type { Meta, StoryObj } from '@storybook/nextjs';
import { TextLink } from './TextLink';

const meta = {
  title: 'UI/TextLink',
  component: TextLink,
  args: { href: '/about', children: 'Read more' },
} satisfies Meta<typeof TextLink>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Internal links go through `next/link`; the trailing ↗ is always rendered. */
export const Internal: Story = {};

/** External links get `target="_blank"` plus `rel="noopener noreferrer"`. */
export const External: Story = {
  args: { href: 'https://example.com', isExternal: true, children: 'Visit the live site' },
};
