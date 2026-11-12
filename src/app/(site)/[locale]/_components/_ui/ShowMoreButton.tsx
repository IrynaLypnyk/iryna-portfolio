'use client';
import { ActionBox } from '@/app/(site)/[locale]/_components/_ui/ActionBox';
import { Minus, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type Props = {
  open: boolean;
  setOpenAction: () => void;
  detailsId: string;
  projectTitle: string;
  className?: string;
  btnLabel?: string;
};

export function ShowMoreButton({
  open,
  setOpenAction,
  detailsId,
  projectTitle,
  className,
  btnLabel,
}: Props) {
  const t = useTranslations('Work');
  const defaultLabel = open ? t('hideDetails') : t('showDetails');
  const label = btnLabel ? btnLabel : defaultLabel;
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-controls={detailsId}
      aria-label={`${open ? t('hideDetails') : t('showDetails')}: ${projectTitle}`}
      onClick={setOpenAction}
      className={cn('flex cursor-pointer items-center gap-x-2', className)}
    >
      <ActionBox>
        {open ? <Minus size={16} strokeWidth={2} /> : <Plus size={16} strokeWidth={2} />}
      </ActionBox>
      <span
        className={cn('text-app-accent-bright-text font-mono text-sm', !btnLabel && 'md:hidden')}
      >
        {label}
      </span>
    </button>
  );
}
