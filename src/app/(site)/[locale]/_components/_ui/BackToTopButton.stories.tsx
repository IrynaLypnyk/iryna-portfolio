import type { Meta, StoryObj } from '@storybook/nextjs';
import { BackToTopButton } from './BackToTopButton';

const meta = {
  title: 'UI/BackToTopButton',
  component: BackToTopButton,
} satisfies Meta<typeof BackToTopButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The button only fades in past 400px of scroll, so the story ships a tall
 * filler column — scroll the preview pane to bring it in. Before that it is
 * `pointer-events-none` and fully transparent rather than unmounted, which is
 * what lets the fade run in both directions.
 */
export const Default: Story = {
  render: () => (
    <div>
      <BackToTopButton />
      <div className="grid gap-4 p-8">
        {Array.from({ length: 40 }, (_, index) => (
          <p key={index} className="text-app-muted">
            Filler paragraph {index + 1} — keep scrolling to reveal the button.
          </p>
        ))}
      </div>
    </div>
  ),
};
