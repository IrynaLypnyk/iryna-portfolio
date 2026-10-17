'use client';
import { useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { AdminButton } from '../../_components/AdminButton';

export function EditorSaveBar({
  dirty,
  saving,
  uploading,
  error = false,
  onDiscardAction,
}: {
  dirty: boolean;
  saving: boolean;
  uploading: boolean;
  error?: boolean;
  onDiscardAction: () => void;
}) {
  const bar = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(112);
  useEffect(() => {
    const element = bar.current;
    if (!element) return;
    const measure = () => setHeight(element.getBoundingClientRect().height);
    const observer = new ResizeObserver(measure);
    measure();
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const locked = saving || uploading;
  const saved = !dirty && !error && !locked;
  const status = saving
    ? 'Saving changes…'
    : uploading
      ? 'Uploading media…'
      : error
        ? 'Changes not saved'
        : dirty
          ? 'Unsaved changes'
          : 'All changes saved';
  return (
    <>
      <div aria-hidden="true" style={{ height: height + 24 }} />
      <div
        ref={bar}
        data-component="EditorSaveBar"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgb(0_0_0/0.04)]"
      >
        <div className="mx-auto flex max-w-[1072px] flex-wrap items-center justify-between gap-3 px-6 py-4">
          <span
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="flex w-full items-center gap-2 text-sm text-neutral-600 sm:w-auto"
          >
            {saved && <CheckCircle2 size={18} className="text-green-600" aria-hidden="true" />}
            {status}
          </span>
          <div className="ml-auto flex items-center gap-3">
            <AdminButton
              variant="outline"
              type="button"
              className="rounded-full border-neutral-300 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 disabled:border-neutral-200 disabled:text-neutral-400 disabled:opacity-100"
              onClickAction={onDiscardAction}
              disabled={locked || (!dirty && !error)}
            >
              Discard
            </AdminButton>
            <AdminButton
              type="submit"
              className="rounded-full bg-neutral-950 text-white hover:bg-neutral-800 disabled:bg-neutral-100 disabled:text-neutral-400 disabled:opacity-100"
              disabled={locked || (!dirty && !error)}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </AdminButton>
          </div>
        </div>
      </div>
    </>
  );
}
