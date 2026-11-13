import type { Meta, StoryObj } from '@storybook/nextjs';
import { routes } from '@/constants/routes';
import { AdminNav } from './AdminNav';
import { DashboardOverview } from './DashboardOverview';

const meta = {
  title: 'Admin/DashboardOverview',
  component: DashboardOverview,
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true, navigation: { pathname: routes.admin.root } },
  },
  decorators: [
    (Story) => (
      <div className="bg-app-page text-app-text min-h-screen">
        <AdminNav />
        <Story />
      </div>
    ),
  ],
  args: {
    stats: [
      { label: 'Projects', value: 24, detail: '6 drafts', href: routes.admin.projects },
      { label: 'Published projects', value: 18, detail: '5 featured', href: routes.admin.projects },
      {
        label: 'Experiments',
        value: 8,
        detail: '5 published · 3 drafts',
        href: routes.admin.experiments,
      },
      { label: 'Media files', value: 146, detail: '12 unused', href: routes.admin.media },
    ],
    breakdowns: [
      {
        title: 'Projects by status',
        items: [
          { label: 'Completed', count: 16 },
          { label: 'In progress', count: 6 },
          { label: 'Concept', count: 2 },
        ],
      },
      {
        title: 'Projects by type',
        items: [
          { label: 'Web application', count: 12 },
          { label: 'Website', count: 8 },
          { label: 'Design system', count: 4 },
        ],
      },
    ],
  },
} satisfies Meta<typeof DashboardOverview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};
export const Empty: Story = {
  args: {
    stats: meta.args.stats.map((stat) => ({ ...stat, value: 0, detail: 'No content yet' })),
    breakdowns: [
      {
        title: 'Projects by status',
        items: [
          { label: 'Completed', count: 0 },
          { label: 'In progress', count: 0 },
        ],
      },
      { title: 'Projects by type', items: [] },
    ],
  },
};
