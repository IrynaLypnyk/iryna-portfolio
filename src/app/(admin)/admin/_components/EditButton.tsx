import { Pencil } from 'lucide-react';
import { AdminButton, type AdminButtonProps } from './AdminButton';

export type EditButtonProps<T = AdminButtonProps> = T extends AdminButtonProps
  ? Omit<T, 'children' | 'startIcon' | 'endIcon' | 'variant' | 'tone'>
  : never;

export function EditButton({ size = 'sm', ...props }: EditButtonProps) {
  return (
    <AdminButton
      {...props}
      variant="outline"
      size={size}
      startIcon={<Pencil size={size === 'sm' ? 14 : 16} strokeWidth={1.75} aria-hidden="true" />}
    >
      Edit
    </AdminButton>
  );
}
