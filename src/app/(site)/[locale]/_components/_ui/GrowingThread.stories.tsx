import type { Meta, StoryObj } from '@storybook/nextjs';
import { GrowingThread } from './GrowingThread';

const meta = {
  title: 'UI/GrowingThread',
  component: GrowingThread,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof GrowingThread>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A fixed decorative stem in the left gutter whose `stroke-dashoffset` tracks
 * scroll progress: it starts 10% drawn, the two stitches fade in past ~62% and
 * ~70%, and the cross-stitch mark draws itself in the last 12%.
 *
 * It is hidden below `md`, so widen the preview pane to see anything. The tall
 * filler below exists to give the page something to scroll.
 */
export const Default: Story = {
  render: () => (
    <div>
      <GrowingThread />
      <div className="grid gap-4 p-8 pl-24">
        {Array.from({ length: 60 }, (_, index) => (
          <p key={index} className="text-app-muted">
            Filler paragraph {index + 1} — scroll to grow the thread.
          </p>
        ))}
      </div>
    </div>
  ),
};

/**
 * Short page: `scrollHeight - innerHeight` is 0, so progress pins at 0 and the
 * stem stays at its 10% baseline instead of dividing by zero.
 */
export const NothingToScroll: Story = {
  render: () => (
    <div>
      <GrowingThread />
      <div className="p-8 pl-24">
        <p className="text-app-muted">A page too short to scroll.</p>
      </div>
    </div>
  ),
};
