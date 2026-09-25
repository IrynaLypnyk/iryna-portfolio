export type PhotoUpdateInput = {
  orderInProject: number;
  isProjectCover: boolean;
  captionUk: string | null;
  captionEn: string | null;
  linkUrl: string | null;
  descriptionUk: string | null;
  descriptionEn: string | null;
};

type ValidationResult =
  | { data: PhotoUpdateInput; error?: undefined }
  | { data?: undefined; error: string };

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

/** Trims a caption down to `string | null` — an empty caption is stored as null. */
function normalizeCaption(value: string | null): string | null {
  return value?.trim() || null;
}

/** Validates and normalizes a photo metadata update. */
export function validatePhotoUpdateInput(body: unknown): ValidationResult {
  if (typeof body !== 'object' || body === null) {
    return { error: 'Некоректні дані запиту' };
  }

  const {
    orderInProject,
    isProjectCover,
    captionUk,
    captionEn,
    linkUrl,
    descriptionUk,
    descriptionEn,
  } = body as Record<string, unknown>;

  if (typeof orderInProject !== 'number' || !Number.isInteger(orderInProject)) {
    return { error: 'Порядок має бути цілим числом' };
  }

  if (!isNullableString(captionUk)) {
    return { error: 'captionUk має бути рядком або null' };
  }

  if (!isNullableString(captionEn)) {
    return { error: 'captionEn має бути рядком або null' };
  }

  if (!isNullableString(linkUrl)) {
    return { error: 'linkUrl має бути рядком або null' };
  }

  const normalizedLinkUrl = linkUrl?.trim() || null;

  if (normalizedLinkUrl !== null && !/^https?:\/\//.test(normalizedLinkUrl)) {
    return { error: 'Посилання для галереї має починатися з http:// або https://' };
  }

  if (!isNullableString(descriptionUk)) {
    return { error: 'descriptionUk має бути рядком або null' };
  }

  if (!isNullableString(descriptionEn)) {
    return { error: 'descriptionEn має бути рядком або null' };
  }

  return {
    data: {
      orderInProject,
      isProjectCover: isProjectCover === true,
      captionUk: normalizeCaption(captionUk),
      captionEn: normalizeCaption(captionEn),
      linkUrl: normalizedLinkUrl,
      descriptionUk: normalizeCaption(descriptionUk),
      descriptionEn: normalizeCaption(descriptionEn),
    },
  };
}
