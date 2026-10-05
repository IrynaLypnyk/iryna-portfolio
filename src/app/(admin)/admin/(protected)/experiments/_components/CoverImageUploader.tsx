'use client';

import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { upload } from '@imagekit/javascript';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { AdminButton } from '@/app/(admin)/admin/_components/AdminButton';
import { AdminMediaPreview } from '@/app/(admin)/admin/(protected)/_components/AdminMediaPreview';
import { validateImageFiles } from '@/lib/media/validate-image-files';
import { apiRoutes } from '@/constants/routes';

export type CoverImage = {
  id: string;
  imageUrl: string;
  width: number;
  height: number;
};

type Props = {
  experimentId: string;
  cover: CoverImage | null;
  onCoverChangeAction: (cover: CoverImage) => void;
};

/**
 * Single-image uploader for an experiment's cover — unlike `PhotoManager`,
 * there's no gallery/reorder/caption to manage, just "upload" or "replace".
 */
export function CoverImageUploader({ experimentId, cover, onCoverChangeAction }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (validateImageFiles([file]).length === 0) {
      return;
    }

    setIsUploading(true);

    try {
      const authResponse = await fetch(apiRoutes.admin.experimentCoverUploadAuth(experimentId));
      const authJson = await authResponse.json();

      if (!authResponse.ok) {
        throw new Error(authJson.message ?? 'Failed to get upload parameters');
      }

      const imageKitResult = await upload({
        file,
        fileName: file.name,
        token: authJson.token,
        signature: authJson.signature,
        expire: authJson.expire,
        publicKey: authJson.publicKey,
        folder: authJson.folder,
        useUniqueFileName: true,
        overwriteFile: false,
      });

      if (!imageKitResult.fileId) {
        throw new Error('ImageKit did not return fileId');
      }

      const response = await fetch(apiRoutes.admin.experimentCoverUpload(experimentId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: imageKitResult.fileId }),
      });

      const json = (await response.json()) as { cover?: CoverImage; message?: string };

      if (!response.ok || !json.cover) {
        throw new Error(json.message ?? 'Failed to save cover');
      }

      onCoverChangeAction(json.cover);
      toast.success('Cover updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload cover');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      {cover ? (
        <AdminMediaPreview
          src={cover.imageUrl}
          className="h-20 w-28 shrink-0"
          sizes="112px"
          alt=""
        />
      ) : (
        <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg border border-dashed border-neutral-300 text-center text-[11px] text-neutral-400">
          No cover
        </div>
      )}

      <div className="grid gap-1.5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <AdminButton
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClickAction={() => fileInputRef.current?.click()}
          startIcon={<Upload size={14} strokeWidth={1.75} />}
        >
          {isUploading ? 'Uploading…' : cover ? 'Replace cover' : 'Upload cover'}
        </AdminButton>
      </div>
    </div>
  );
}
