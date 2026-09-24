import type { Meta, StoryObj } from '@storybook/nextjs';
import { AppLink } from './AppLink';

const meta = {
  title: 'UI/AppLink',
  component: AppLink,
  args: { href: '#', children: 'View the case study' },
  argTypes: {
    color: { control: 'inline-radio', options: ['blue', 'gray', 'black'] },
  },
} satisfies Meta<typeof AppLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithRightArrow: Story = {
  args: { arrow: 'right' },
};

export const PlainBlue: Story = {
  args: { variant: 'plain', arrow: 'right', color: 'blue' },
};

export const PlainGray: Story = {
  args: { variant: 'plain', arrow: 'right', color: 'gray' },
};

export const PlainBlack: Story = {
  args: { variant: 'plain', arrow: 'right', color: 'black' },
};

export const Underline: Story = {
  args: { variant: 'underline', arrow: 'right' },
};

export const UnderlineBlue: Story = {
  args: { variant: 'underline', arrow: 'right', color: 'blue' },
};

export const UnderlineGray: Story = {
  args: { variant: 'underline', arrow: 'right', color: 'gray' },
};

export const UnderlineBlack: Story = {
  args: { variant: 'underline', arrow: 'right', color: 'black' },
};

export const InternalArrowRight: Story = {
  args: { href: '/projects/atlas-design-system', internal: true, arrow: 'right' },
};

export const ExternalArrowUpRight: Story = {
  args: { href: 'https://example.com', external: true, arrow: 'upRight' },
};

export const PlainMonoArrowAfter: Story = {
  args: {
    href: '/projects/atlas-design-system',
    internal: true,
    arrow: 'right',
    arrowPosition: 'after',
    fontMono: true,
  },
};

export const PlainMonoArrowBefore: Story = {
  args: {
    href: '/projects/atlas-design-system',
    internal: true,
    arrow: 'right',
    arrowPosition: 'before',
    fontMono: true,
  },
};

export const AllArrowOptions: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-5">
      <AppLink {...args} arrow="none">
        No glyph
      </AppLink>
      <AppLink {...args} arrow="right">
        Right
      </AppLink>
      <AppLink {...args} arrow="down">
        Down
      </AppLink>
      <AppLink {...args} arrow="upRight">
        External
      </AppLink>
    </div>
  ),
};
