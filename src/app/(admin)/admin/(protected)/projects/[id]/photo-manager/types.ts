export type PhotoRow = {
  id: string;
  imageUrl: string;
  width: number;
  height: number;
  orderInProject: number;
  isProjectCover: boolean;
  captionUk: string | null;
  captionEn: string | null;
  linkUrl: string | null;
  descriptionUk: string | null;
  descriptionEn: string | null;
};

export type PhotoManagerProps = {
  projectId: string;
  projectSlug: string;
  photos: PhotoRow[];
};

export type EditableFields = Pick<
  PhotoRow,
  | 'orderInProject'
  | 'isProjectCover'
  | 'captionUk'
  | 'captionEn'
  | 'linkUrl'
  | 'descriptionUk'
  | 'descriptionEn'
>;

export type EditablePhoto = PhotoRow & {
  draft: EditableFields;
};

export type RowStatus = 'idle' | 'saving' | 'deleting';

export type UpdateDraft = <Key extends keyof EditableFields>(
  id: string,
  key: Key,
  value: EditableFields[Key]
) => void;

export type UploadStatus = 'queued' | 'uploading' | 'done' | 'error';

export type UploadItem = {
  uid: string;
  fileName: string;
  file: File;
  status: UploadStatus;
  errorMessage?: string;
};
