import type { Meta, StoryObj } from '@storybook/nextjs';
import { MobileNav } from './MobileNav';
import { anchors } from '@/constants/routes';

const meta = {
  title: 'UI/MobileNav',
  component: MobileNav,
  args: { isMenuOpen: true, activeId: anchors.projects, closeMobileMenu: () => {} },
} satisfies Meta<typeof MobileNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpenOnMobile: Story = {
  args: { activeId: anchors.about },
  globals: {
    viewport: {
      value: 'mobile1',
      isRotated: false,
    },
  },
};
