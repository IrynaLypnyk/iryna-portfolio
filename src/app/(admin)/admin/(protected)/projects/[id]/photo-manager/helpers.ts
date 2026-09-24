import type { EditableFields, EditablePhoto, PhotoRow } from './types';

export function toEditableFields(photo: PhotoRow): EditableFields {
  return {
    orderInProject: photo.orderInProject,
    isProjectCover: photo.isProjectCover,
    captionUk: photo.captionUk,
    captionEn: photo.captionEn,
  };
}

export function toEditablePhoto(photo: PhotoRow): EditablePhoto {
  return {
    ...photo,
    draft: toEditableFields(photo),
  };
}

export function isDraftEqual(a: EditableFields, b: EditableFields): boolean {
  return (
    a.orderInProject === b.orderInProject &&
    a.isProjectCover === b.isProjectCover &&
    a.captionUk === b.captionUk &&
    a.captionEn === b.captionEn
  );
}
