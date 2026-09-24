import type { Meta, StoryObj } from '@storybook/nextjs';
import { SiteHeader } from './SiteHeader';

const meta = {
  title: 'Layouts/SiteHeader',
  component: SiteHeader,
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithScrollSpy: Story = {
  render: () => (
    <div>
      <SiteHeader />
      {['projects', 'about', 'contact'].map((id) => (
        <section key={id} id={id} className="border-app-line border-b p-8">
          <h2 className="mb-6 text-2xl capitalize">{id}</h2>
          {Array.from({ length: 14 }, (_, index) => (
            <p key={index} className="text-app-muted">
              {id} filler {index + 1}
            </p>
          ))}
        </section>
      ))}
    </div>
  ),
};

export const Mobile: Story = {
  globals: {
    viewport: {
      value: 'mobile1',
      isRotated: false,
    },
  },
};
