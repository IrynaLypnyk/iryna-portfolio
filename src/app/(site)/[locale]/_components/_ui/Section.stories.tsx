import type { Meta, StoryObj } from '@storybook/nextjs';
import { Section } from './Section';
import { anchors } from '@/constants/routes';

const meta = {
  title: 'UI/Section',
  component: Section,
  args: {
    id: anchors.about,
    children: <div className="bg-app-surface p-8 text-center">Section content</div>,
  },
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * `Section` owns the vertical rhythm (`--section-py`) and the inner anchor
 * target, which carries `scroll-mt-(--header-height)` so a hash link does not
 * land under the sticky header.
 */
export const Default: Story = {};

export const Stacked: Story = {
  render: () => (
    <>
      <Section id={anchors.projects}>
        <div className="bg-app-surface p-8 text-center">Projects</div>
      </Section>
      <Section id={anchors.about}>
        <div className="bg-app-surface p-8 text-center">About</div>
      </Section>
    </>
  ),
};
