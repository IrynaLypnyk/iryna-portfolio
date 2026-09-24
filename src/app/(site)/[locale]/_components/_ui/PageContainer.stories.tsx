import type { Meta, StoryObj } from '@storybook/nextjs';
import { PageContainer } from './PageContainer';

const meta = {
  title: 'UI/PageContainer',
  component: PageContainer,
} satisfies Meta<typeof PageContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The container itself is invisible — the dashed outline here is story-only,
 * to make the `--page-max` cap and the asymmetric padding visible.
 */
const content = (
  <div className="bg-app-surface py-30 text-center text-sm">
    Content sits inside the page gutters
  </div>
);
export const Default: Story = {
  args: {
    className: 'outline-1 outline-dashed outline-app-accent/40',
    children: content,
  },
};

export const OnMobiles: Story = {
  args: {
    className: 'outline-1 outline-dashed outline-app-accent/40',
    children: content,
  },
  globals: {
    viewport: {
      value: 'mobile1',
      isRotated: false,
    },
  },
};
