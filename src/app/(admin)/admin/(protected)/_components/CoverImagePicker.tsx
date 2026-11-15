'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Check, X } from 'lucide-react';
import { AdminButton } from '../../_components/AdminButton';
import { AdminMediaPreview } from './AdminMediaPreview';
import type { MediaAssetPreview } from '@/lib/media/media-draft';

export type CoverCandidate = { asset: MediaAssetPreview; label: string };

export function CoverImagePicker({
  label,
  selectedId,
  candidates,
  ownerId,
  ownerType,
  disabled,
  onSelectAction,
}: {
  label: string;
  selectedId?: string;
  candidates: CoverCandidate[];
  ownerId?: string;
  ownerType: 'projects' | 'experiments';
  disabled: boolean;
  onSelectAction: (asset: MediaAssetPreview) => void;
}) {
  const [open, setOpen] = useState(false);
  const [library, setLibrary] = useState<CoverCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const images = [
    ...new Map([...library, ...candidates].map((item) => [item.asset.id, item])).values(),
  ];
  const filtered = images.filter(({ label, asset }) =>
    `${label} ${asset.width} ${asset.height}`.toLowerCase().includes(search.trim().toLowerCase())
  );

  async function loadImages() {
    if (!ownerId) return;
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({ ownerId, ownerType });
      const response = await fetch(`/api/admin/media/cover-images?${params}`, {
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('Unable to load images');
      const data: { images: (MediaAssetPreview & { label: string })[] } = await response.json();
      setLibrary(data.images.map(({ label, ...asset }) => ({ asset, label })));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setSearch('');
          void loadImages();
        }
      }}
    >
      <Dialog.Trigger
        type="button"
        disabled={disabled}
        aria-label={`Choose an existing image for ${label}`}
        className="border-app-accent-bright text-app-accent-bright hover:bg-app-accent-lightest rounded-sm border px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
      >
        {selectedId ? 'Change image' : 'Choose image'}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 flex max-h-[85dvh] w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-sm border border-neutral-200 bg-white p-5 shadow-xl sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <Dialog.Title className="text-lg font-semibold text-neutral-900">
              Choose an image for {label}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close image picker"
              className="rounded-sm p-2 hover:bg-neutral-100"
            >
              <X size={18} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="mt-1 text-sm text-neutral-600">
            Select a thumbnail. Previously uploaded covers remain available when you change the
            cover.
          </Dialog.Description>
          <input
            type="search"
            aria-label="Search images"
            placeholder="Search by name or dimensions"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="my-4 w-full rounded-sm border border-neutral-300 px-3 py-2 text-sm"
          />
          {loading && (
            <p role="status" className="mb-3 text-sm text-neutral-500">
              Loading uploaded images…
            </p>
          )}
          {error && (
            <div role="alert" className="mb-3 flex items-center gap-3 text-sm text-neutral-600">
              Could not load uploaded images. Images already in this draft are still available.
              <AdminButton
                type="button"
                variant="ghost"
                size="sm"
                onClickAction={() => void loadImages()}
              >
                Retry
              </AdminButton>
            </div>
          )}
          <div className="min-h-0 overflow-y-auto p-1">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map(({ asset, label }, index) => (
                <button
                  key={asset.id}
                  type="button"
                  aria-label={`Select image ${index + 1}: ${label} (${asset.width} × ${asset.height})`}
                  aria-pressed={asset.id === selectedId}
                  disabled={disabled}
                  onClick={() => {
                    onSelectAction(asset);
                    setOpen(false);
                  }}
                  className={`hover:border-app-accent-bright focus-visible:outline-app-accent-bright relative rounded-sm border-2 p-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${asset.id === selectedId ? 'border-app-accent-bright bg-app-accent-lightest' : 'border-neutral-200'}`}
                >
                  <AdminMediaPreview
                    src={asset.imageUrl}
                    mimeType={asset.mimeType}
                    className="aspect-[4/3] w-full"
                    sizes="200px"
                    fit="contain"
                  />
                  <span
                    className="mt-2 block truncate text-xs font-medium text-neutral-900"
                    title={label}
                  >
                    {label}
                  </span>
                  <span className="block text-xs text-neutral-500">
                    {asset.width} × {asset.height}
                  </span>
                  {asset.id === selectedId && (
                    <span className="bg-app-accent-bright absolute top-3 right-3 flex items-center gap-1 rounded-sm px-2 py-1 text-xs text-white">
                      <Check size={12} />
                      Selected
                    </span>
                  )}
                </button>
              ))}
            </div>
            {!filtered.length && !loading && (
              <p className="py-8 text-center text-sm text-neutral-500">No images found.</p>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <Dialog.Close className="rounded-sm border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100">
              Cancel
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
