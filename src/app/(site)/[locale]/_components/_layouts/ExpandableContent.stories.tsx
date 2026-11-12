import type { Meta, StoryObj } from '@storybook/nextjs';
import { ExpandableContent } from './ExpandableContent';

const meta = {
  title: 'Layouts/ExpandableContent',
  component: ExpandableContent,
  args: {
    label: 'Example project',
    visibleContent: (
      <div className="flex flex-col gap-2">
        <h3 className="text-2xl font-medium">Example project</h3>
        <p className="text-app-muted">This summary is always visible.</p>
      </div>
    ),
    expandedContent: (
      <div className="flex flex-col gap-2">
        <p>Additional details can contain any React content.</p>
        <p className="text-app-muted">Metadata, links, and galleries can be passed here.</p>
      </div>
    ),
    expandedContentClassName: 'pt-4',
  },
  argTypes: {
    visibleContent: { control: false },
    expandedContent: { control: false },
  },
} satisfies Meta<typeof ExpandableContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InitiallyOpen: Story = {
  args: { defaultOpen: true },
};

export const WithoutExpansion: Story = {
  args: { expandable: false },
};
