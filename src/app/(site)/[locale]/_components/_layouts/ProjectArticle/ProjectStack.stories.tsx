import type { Meta, StoryObj } from '@storybook/nextjs';
import { ProjectStack } from './ProjectStack';

const meta = {
  title: 'UI/ProjectStack',
  component: ProjectStack,
  args: {
    items: ['React', 'TypeScript', 'Next.js'],
    size: 'lg',
    color: 'gray',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'lg'] },
    color: { control: 'inline-radio', options: ['blue', 'gray'] },
  },
} satisfies Meta<typeof ProjectStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SmallBlue: Story = {
  args: { size: 'sm', color: 'blue' },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="grid gap-6">
      {(['sm', 'lg'] as const).map((size) =>
        (['blue', 'gray'] as const).map((color) => (
          <div key={`${size}-${color}`} className="grid gap-2">
            <span className="text-app-muted text-xs">
              {size} / {color}
            </span>
            <ProjectStack {...args} size={size} color={color} />
          </div>
        ))
      )}
    </div>
  ),
};

export const Wrapping: Story = {
  args: {
    items: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Prisma',
      'PostgreSQL',
      'ImageKit',
      'next-intl',
      'Google OAuth',
      'Storybook',
      'Vercel',
    ],
  },
  render: (args) => (
    <div className="max-w-64">
      <ProjectStack {...args} />
    </div>
  ),
};

export const SingleItem: Story = {
  args: { items: ['TypeScript'] },
};

export const Empty: Story = {
  args: { items: [] },
};
