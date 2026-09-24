import type { Meta, StoryObj } from '@storybook/nextjs';
import { SectionNav } from './SectionNav';
import { anchors } from '@/constants/routes';

const meta = {
  title: 'UI/SectionNav',
  component: SectionNav,
  args: { activeId: anchors.projects },
  argTypes: {
    activeId: { control: 'inline-radio', options: ['', ...Object.values(anchors)] },
  },
} satisfies Meta<typeof SectionNav>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The active link gains an accent underline and semibold weight. */
export const ProjectsActive: Story = {};

export const AboutActive: Story = {
  args: { activeId: anchors.about },
};

export const ContactActive: Story = {
  args: { activeId: anchors.contact },
};

/** Top of the page: no section has crossed the activation point yet. */
export const NoneActive: Story = {
  args: { activeId: '' },
};
