import type { Meta, StoryObj } from '@storybook/nextjs';
import { ProjectStack } from './ProjectStack';

const meta = {
  title: 'UI/ProjectStack',
  component: ProjectStack,
  args: {
    items: ['React', 'TypeScript', 'Next.js'],
    separator: 'dot',
    size: 'lg',
    color: 'gray',
  },
  argTypes: {
    separator: { control: 'inline-radio', options: ['dot', 'comma'] },
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

export const CommaSeparator: Story = {
  args: { separator: 'comma' },
};

export const AllVariants: Story = {
  render: (args) => (
    <div className="grid gap-6">
      {(['sm', 'lg'] as const).map((size) =>
        (['blue', 'gray'] as const).map((color) =>
          (['dot', 'comma'] as const).map((separator) => (
            <div key={`${size}-${color}-${separator}`} className="grid gap-2">
              <span className="text-app-muted text-xs">
                {size} / {color} / {separator}
              </span>
              <ProjectStack {...args} size={size} color={color} separator={separator} />
            </div>
          ))
        )
      )}
    </div>
  ),
};

export const Wrapping: Story = {
  args: { items: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Prisma', 'PostgreSQL'] },
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
