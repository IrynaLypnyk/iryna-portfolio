import type { Meta, StoryObj } from '@storybook/nextjs';
import { ProjectArticle } from './ProjectArticle';
import { featuredProject, projectWithoutCover, sparseProject } from '@/storybook/fixtures';

const meta = {
  title: 'Layouts/ProjectArticle',
  component: ProjectArticle,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: { project: featuredProject, index: 1 },
  argTypes: {
    project: { control: false },
    index: { control: { type: 'number', min: 1, max: 20 } },
    reversed: { control: 'boolean' },
    isLast: { control: 'boolean' },
  },
} satisfies Meta<typeof ProjectArticle>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Image left, copy right. `index` is zero-padded into the "01" kicker. */
export const Default: Story = {};

/** `reversed` flips the grid — the page alternates sides down the list. */
export const Reversed: Story = {
  args: { reversed: true, index: 2 },
};

/** The meta list only renders the rows that exist, so no empty `<dt>` appears. */
export const WithoutCover: Story = {
  args: { project: projectWithoutCover, index: 2 },
};

/** Role only: `stack` and `status` are both null. */
export const MinimalMeta: Story = {
  args: { project: sparseProject, index: 3 },
};

/** The last article uses tighter bottom padding than the ones above it. */
export const Last: Story = {
  args: { isLast: true },
};

/** Two in sequence, the way `Projects` renders them. */
export const AlternatingPair: Story = {
  render: () => (
    <div>
      <ProjectArticle project={featuredProject} index={1} />
      <ProjectArticle project={projectWithoutCover} index={2} reversed isLast />
    </div>
  ),
};
