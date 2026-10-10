import type { Meta, StoryObj } from '@storybook/nextjs';
import { EarlierProjectArticle } from './EarlierProjectArticle';
import { featuredProject, projectWithoutCover, sparseProject } from '@/storybook/fixtures';

const meta = {
  title: 'Layouts/EarlierProjectArticle',
  component: EarlierProjectArticle,
  args: { project: featuredProject, index: 1 },
  argTypes: {
    project: { control: false },
    index: { control: { type: 'number', min: 1, max: 20 } },
  },
} satisfies Meta<typeof EarlierProjectArticle>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default summary metadata with features and gallery behind the toggle. */
export const Default: Story = {};

/** The meta list only renders the rows that exist, so no empty `<dt>` appears. */
export const WithoutCover: Story = {
  args: { project: projectWithoutCover, index: 2 },
};

/** Missing optional metadata is omitted automatically. */
export const MinimalMeta: Story = {
  args: { project: sparseProject, index: 3 },
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
      <EarlierProjectArticle project={featuredProject} index={1} />
      <EarlierProjectArticle project={projectWithoutCover} index={2} />
    </div>
  ),
};
