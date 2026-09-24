import type { ComponentProps } from 'react';
import { useEffect, useId } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { toast } from 'sonner';
import { AdminButton } from './AdminButton';
import { Toaster } from './Toaster';

type ToastKind = 'default' | 'success' | 'info' | 'warning' | 'error' | 'loading';
type StoryArgs = ComponentProps<typeof Toaster> & { kind: ToastKind };

const messages: Record<ToastKind, string> = {
  default: 'Зміни збережено',
  success: 'Проєкт успішно збережено',
  info: 'Доступне оновлення',
  warning: 'Є незбережені зміни',
  error: 'Не вдалося зберегти проєкт',
  loading: 'Завантаження фотографій…',
};

function ToastPreview({ kind, ...props }: StoryArgs) {
  const id = useId();

  // Each preview owns its notification, including cleanup when switching stories.
  useEffect(
    () => () => {
      toast.dismiss(id);
    },
    [id]
  );

  const showToast = () => {
    const options = {
      id,
      toasterId: id,
      description: 'Приклад повідомлення адміністративної панелі.',
    };
    if (kind === 'default') toast(messages[kind], options);
    else toast[kind](messages[kind], options);
  };

  return (
    <div className="flex min-h-64 items-end gap-3 p-4">
      <Toaster {...props} id={id} />
      <AdminButton onClickAction={showToast}>Показати повідомлення</AdminButton>
      <AdminButton variant="outline" onClickAction={() => toast.dismiss(id)}>
        Приховати
      </AdminButton>
    </div>
  );
}

const meta = {
  title: 'Admin/Toaster',
  component: Toaster,
  // parameters: {
  //   // Fixed-position toasts stay inside their own preview in the Docs page.
  //   docs: { story: { inline: false, iframeHeight: 320 } },
  // },
  args: { kind: 'default', duration: 5000, closeButton: true },
  argTypes: {
    kind: {
      control: 'select',
      options: ['default', 'success', 'info', 'warning', 'error', 'loading'],
    },
    position: {
      control: 'select',
      options: [
        'top-left',
        'top-center',
        'top-right',
        'bottom-left',
        'bottom-center',
        'bottom-right',
      ],
    },
    duration: { control: 'number' },
    closeButton: { control: 'boolean' },
  },
  render: (args) => <ToastPreview {...args} />,
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Success: Story = { args: { kind: 'success' } };
export const Info: Story = { args: { kind: 'info' } };
export const Warning: Story = { args: { kind: 'warning' } };
export const Error: Story = { args: { kind: 'error' } };
export const Loading: Story = { args: { kind: 'loading' } };
