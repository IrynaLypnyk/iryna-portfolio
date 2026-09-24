import type { Meta, StoryObj } from '@storybook/nextjs';
import { UnderlineLink } from './UnderlineLink';

const meta = {
  title: 'UI/UnderlineLink',
  component: UnderlineLink,
  args: { href: '#', children: 'View the case study' },
} satisfies Meta<typeof UnderlineLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The hero CTA: ink text on a pale accent rule. */
export const WithRightArrow: Story = {
  args: { arrow: 'right' },
};

/** `plain` drops the rule and colours the text — the case-study CTA. */
export const Plain: Story = {
  args: { variant: 'plain', arrow: 'right' },
};

/** `internal` routes through next-intl's Link so the href picks up the locale prefix. */
export const Internal: Story = {
  args: { href: '/projects/atlas-design-system', internal: true, arrow: 'right' },
};

export const External: Story = {
  args: { href: 'https://example.com', external: true, arrow: 'external' },
};

export const EveryArrow: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-5">
      <UnderlineLink href="#" arrow="none">
        No glyph
      </UnderlineLink>
      <UnderlineLink href="#" arrow="right">
        Right
      </UnderlineLink>
      <UnderlineLink href="#" arrow="down">
        Down
      </UnderlineLink>
      <UnderlineLink href="#" arrow="external">
        External
      </UnderlineLink>
    </div>
  ),
};
