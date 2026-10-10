'use client';
import { ActionBox } from '@/app/(site)/[locale]/_components/_ui/ActionBox';
import { Minus, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type Props = {
  open: boolean;
  setOpenAction: () => void;
  detailsId: string;
  galleryId: string;
  projectTitle: string;
  className?: string;
};

export function ShowMoreButton({
  open,
  setOpenAction,
  detailsId,
  galleryId,
  projectTitle,
  className,
}: Props) {
  const t = useTranslations('Work');
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={`${detailsId} ${galleryId}`}
      aria-label={`${open ? t('hideDetails') : t('showDetails')}: ${projectTitle}`}
      onClick={setOpenAction}
      className={cn('flex cursor-pointer items-center gap-x-2', className)}
    >
      <ActionBox>
        {open ? <Minus size={16} strokeWidth={2} /> : <Plus size={16} strokeWidth={2} />}
      </ActionBox>
      <span className="text-app-accent-bright font-mono text-sm md:hidden">
        {open ? t('hideDetails') : t('showDetails')}
      </span>
    </button>
  );
}
