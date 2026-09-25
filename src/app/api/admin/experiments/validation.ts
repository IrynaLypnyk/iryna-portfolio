export type ExperimentInput = {
  slug: string;
  titleUk: string;
  titleEn: string;
  descriptionUk: string;
  descriptionEn: string;
  stack: string | null;
  demoUrl: string | null;
  githubUrl: string | null;
  order: number;
  published: boolean;
};

type ValidationResult =
  | { data: ExperimentInput; error?: undefined }
  | { data?: undefined; error: string };

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Trims an optional text field down to `string | null` (empty means "unset"). */
function optionalText(value: unknown): string | null {
  return isNonEmptyString(value) ? value.trim() : null;
}

/**
 * Validates and normalizes the create/update payload for an experiment.
 * Shared by the POST (create) and PATCH (update) admin API routes.
 */
export function validateExperimentInput(body: unknown): ValidationResult {
  if (typeof body !== 'object' || body === null) {
    return { error: 'Некоректні дані запиту' };
  }

  const {
    slug,
    titleUk,
    titleEn,
    descriptionUk,
    descriptionEn,
    stack,
    demoUrl,
    githubUrl,
    order,
    published,
  } = body as Record<string, unknown>;

  if (typeof slug !== 'string' || !SLUG_PATTERN.test(slug)) {
    return { error: 'Slug має містити лише малі літери, цифри та дефіси' };
  }

  if (!isNonEmptyString(titleUk)) return { error: "Поле «Назва (UA)» обов'язкове" };
  if (!isNonEmptyString(titleEn)) return { error: "Поле «Назва (EN)» обов'язкове" };
  if (!isNonEmptyString(descriptionUk)) return { error: "Поле «Опис (UA)» обов'язкове" };
  if (!isNonEmptyString(descriptionEn)) return { error: "Поле «Опис (EN)» обов'язкове" };

  if (typeof order !== 'number' || !Number.isInteger(order)) {
    return { error: 'Порядок має бути цілим числом' };
  }

  const normalizedDemoUrl = optionalText(demoUrl);

  if (normalizedDemoUrl !== null && !/^https?:\/\//.test(normalizedDemoUrl)) {
    return { error: 'Посилання на демо має починатися з http:// або https://' };
  }

  const normalizedGithubUrl = optionalText(githubUrl);

  if (normalizedGithubUrl !== null && !/^https?:\/\//.test(normalizedGithubUrl)) {
    return { error: 'Посилання на GitHub має починатися з http:// або https://' };
  }

  return {
    data: {
      slug,
      titleUk: titleUk.trim(),
      titleEn: titleEn.trim(),
      descriptionUk: descriptionUk.trim(),
      descriptionEn: descriptionEn.trim(),
      stack: optionalText(stack),
      demoUrl: normalizedDemoUrl,
      githubUrl: normalizedGithubUrl,
      order,
      published: published !== false,
    },
  };
}
