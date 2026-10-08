import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { BurgerMenuButton } from './BurgerMenuButton';

const meta = {
  title: 'UI/BurgerMenuButton',
  component: BurgerMenuButton,
  args: { isMenuOpen: false, toggleMobileMenuAction: () => {} },
} satisfies Meta<typeof BurgerMenuButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};

export const Open: Story = {
  args: { isMenuOpen: true },
};

export const Default: Story = {
  render: function Interactive() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
      <BurgerMenuButton
        isMenuOpen={isMenuOpen}
        toggleMobileMenuAction={() => setIsMenuOpen((previous) => !previous)}
      />
    );
  },
};
