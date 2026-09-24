import type { Meta, StoryObj } from '@storybook/nextjs';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminButton } from './AdminButton';
import { routes } from '@/constants/routes';

const meta: Meta<typeof AdminButton> = {
  title: 'Admin/AdminButton',
  component: AdminButton,
  args: {
    variant: 'solid',
    tone: 'default',
    size: 'md',
    children: 'Зберегти зміни',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'ghost', 'icon'],
    },
    tone: {
      control: 'radio',
      options: ['default', 'danger'],
    },
    size: {
      control: 'radio',
      options: ['md', 'sm'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof AdminButton>;

// ─── Solid ────────────────────────────────────────────────────────────────────

export const Solid: Story = {};

export const SolidSmall: Story = {
  name: 'Solid (sm)',
  args: { size: 'sm' },
};

export const SolidDanger: Story = {
  name: 'Solid (danger)',
  args: { tone: 'danger', children: 'Видалити' },
};

// ─── Outline ──────────────────────────────────────────────────────────────────

export const Outline: Story = {
  args: { variant: 'outline', children: 'Скасувати' },
};

export const OutlineSmall: Story = {
  name: 'Outline (sm)',
  args: { variant: 'outline', size: 'sm', children: 'Редагувати' },
};

export const OutlineDanger: Story = {
  name: 'Outline (danger)',
  args: { variant: 'outline', tone: 'danger', children: 'Видалити' },
};

// ─── Ghost ────────────────────────────────────────────────────────────────────

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Вийти' },
};

// ─── Icon + text ──────────────────────────────────────────────────────────────

export const WithIcon: Story = {
  name: 'Solid + icon',
  args: {
    startIcon: <Plus size={16} strokeWidth={2} aria-hidden="true" />,
    children: 'Новий проєкт',
  },
};

export const OutlineWithIcon: Story = {
  name: 'Outline + icon',
  args: {
    variant: 'outline',
    startIcon: <Pencil size={14} strokeWidth={2} aria-hidden="true" />,
    children: 'Редагувати',
    size: 'sm',
  },
};

// ─── Icon only ────────────────────────────────────────────────────────────────

export const IconDefault: Story = {
  name: 'Icon (default)',
  args: {
    variant: 'icon',
    children: <Pencil size={16} strokeWidth={1.75} aria-hidden="true" />,
  },
};

export const IconDanger: Story = {
  name: 'Icon (danger)',
  args: {
    variant: 'icon',
    tone: 'danger',
    children: <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />,
  },
};

export const IconDangerSmall: Story = {
  name: 'Icon (danger, sm)',
  args: {
    variant: 'icon',
    tone: 'danger',
    size: 'sm',
    children: <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" />,
  },
};

// ─── Delete — outlined danger (used in admin tables) ─────────────────────────

export const OutlineDangerWithIcon: Story = {
  name: 'Outline danger + icon (delete)',
  args: {
    variant: 'outline',
    tone: 'danger',
    size: 'sm',
    startIcon: <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" />,
    children: 'Видалити',
  },
};

// ─── States ───────────────────────────────────────────────────────────────────

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledOutline: Story = {
  name: 'Disabled (outline)',
  args: { variant: 'outline', disabled: true, children: 'Скасувати' },
};

// ─── As link ──────────────────────────────────────────────────────────────────

export const AsLink: Story = {
  name: 'As link (href)',
  args: {
    variant: 'outline',
    href: routes.admin.projectNew,
    children: 'Новий проєкт',
  },
};

export const AsExternalLink: Story = {
  name: 'As external link',
  args: {
    variant: 'ghost',
    href: 'https://example.com',
    external: true,
    children: 'Відкрити сайт',
  },
};
