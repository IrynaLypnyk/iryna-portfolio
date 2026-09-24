'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AdminButton } from '@/app/(admin)/admin/_components/AdminButton';
import { AdminDeleteDialog } from '@/app/(admin)/admin/(protected)/_components/AdminDeleteDialog';
import { apiRoutes } from '@/constants/routes';

type Props = {
  id: string;
  title: string;
};

export function ProjectDeleteButton({ id, title }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);

    try {
      const response = await fetch(apiRoutes.admin.project(id), { method: 'DELETE' });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || 'Не вдалося видалити проєкт');
      }

      toast.success('Проєкт видалено');
      setIsConfirming(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не вдалося видалити проєкт');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <AdminButton
        variant="outline"
        tone="danger"
        size="sm"
        onClickAction={() => setIsConfirming(true)}
        disabled={isDeleting}
        startIcon={<Trash2 size={14} strokeWidth={1.75} />}
      >
        {isDeleting ? 'Видалення…' : 'Видалити'}
      </AdminButton>

      {isConfirming && (
        <AdminDeleteDialog
          title={`Видалити «${title}»?`}
          description="Разом із проєктом будуть видалені всі його фото. Цю дію неможливо скасувати."
          isDeleting={isDeleting}
          onConfirmAction={handleDelete}
          onCancelAction={() => setIsConfirming(false)}
        />
      )}
    </>
  );
}
