import type { Meta, StoryObj } from '@storybook/nextjs';
import { MoreWorkRow } from './MoreWorkRow';
import { moreWorkProject, sparseProject } from '@/storybook/fixtures';

const meta = {
  title: 'Layouts/MoreWorkRow',
  component: MoreWorkRow,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: { project: moreWorkProject },
  argTypes: { project: { control: false } },
} satisfies Meta<typeof MoreWorkRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** What a project looks like once `featured` is switched off. */
export const Default: Story = {};

/** No stack and no year, so the right-hand stamp is omitted entirely. */
export const WithoutStamp: Story = {
  args: { project: sparseProject },
};

/** Stacked rows share a single hairline between them. */
export const Stacked: Story = {
  render: () => (
    <div>
      <MoreWorkRow project={moreWorkProject} />
      <MoreWorkRow project={{ ...moreWorkProject, slug: 'atlas', title: 'Atlas' }} />
      <MoreWorkRow project={sparseProject} />
    </div>
  ),
};
