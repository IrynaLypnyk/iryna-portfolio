import type { Meta, StoryObj } from '@storybook/nextjs';
import { RecentProjectArticle } from './RecentProjectArticle';
import { featuredProject, projectWithoutCover, sparseProject } from '@/storybook/fixtures';

const meta = {
  title: 'Layouts/RecentProjectArticle',
  component: RecentProjectArticle,
  args: { project: featuredProject },
  argTypes: {
    project: { control: false },
  },
} satisfies Meta<typeof RecentProjectArticle>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default summary metadata with features and gallery behind the toggle. */
export const Default: Story = {};

/** The meta list only renders the rows that exist, so no empty `<dt>` appears. */
export const WithoutCover: Story = {
  args: { project: projectWithoutCover },
};

/** Missing optional metadata is omitted automatically. */
export const MinimalMeta: Story = {
  args: { project: sparseProject },
};

/** Only features are available in the expanded group. */
export const FeaturesOnly: Story = {
  args: { project: { ...featuredProject, photos: [] } },
};

/** Only the gallery is available in the expanded group. */
export const GalleryOnly: Story = {
  args: { project: { ...featuredProject, features: [] } },
};

/** Two in sequence, the way `Projects` renders them. */
export const Sequence: Story = {
  render: () => (
    <div>
      <RecentProjectArticle project={featuredProject} />
      <RecentProjectArticle project={projectWithoutCover} />
    </div>
  ),
};
