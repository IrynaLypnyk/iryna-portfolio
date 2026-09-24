export type ProjectSectionInput = {
  titleUk: string;
  titleEn: string;
  bodyUk: string;
  bodyEn: string;
  body2Uk: string | null;
  body2En: string | null;
};

export type ProjectInput = {
  slug: string;
  shortLabel: string;
  titleUk: string;
  titleEn: string;
  subtitleUk: string;
  subtitleEn: string;
  contextUk: string;
  contextEn: string;
  leadUk: string;
  leadEn: string;
  roleUk: string;
  roleEn: string;
  stack: string | null;
  statusUk: string | null;
  statusEn: string | null;
  yearLabel: string | null;
  externalUrl: string | null;
  linkLabelUk: string | null;
  linkLabelEn: string | null;
  linkNoteUk: string | null;
  linkNoteEn: string | null;
  order: number;
  featured: boolean;
  published: boolean;
  sections: ProjectSectionInput[];
};

type ValidationResult =
  | { data: ProjectInput; error?: undefined }
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
 * Case-study sections are ordered content, so they arrive as a whole array and
 * are rewritten wholesale rather than patched row by row.
 */
function validateSections(value: unknown): ProjectSectionInput[] | string {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    return 'Секції мають бути масивом';
  }

  const sections: ProjectSectionInput[] = [];

  for (const [index, raw] of value.entries()) {
    if (typeof raw !== 'object' || raw === null) {
      return `Секція ${index + 1}: некоректні дані`;
    }

    const { titleUk, titleEn, bodyUk, bodyEn, body2Uk, body2En } = raw as Record<string, unknown>;

    if (!isNonEmptyString(titleUk)) return `Секція ${index + 1}: заголовок (UA) обов'язковий`;
    if (!isNonEmptyString(titleEn)) return `Секція ${index + 1}: заголовок (EN) обов'язковий`;
    if (!isNonEmptyString(bodyUk)) return `Секція ${index + 1}: текст (UA) обов'язковий`;
    if (!isNonEmptyString(bodyEn)) return `Секція ${index + 1}: текст (EN) обов'язковий`;

    sections.push({
      titleUk: titleUk.trim(),
      titleEn: titleEn.trim(),
      bodyUk: bodyUk.trim(),
      bodyEn: bodyEn.trim(),
      body2Uk: optionalText(body2Uk),
      body2En: optionalText(body2En),
    });
  }

  return sections;
}

/**
 * Validates and normalizes the create/update payload for a project.
 * Shared by the POST (create) and PATCH (update) admin API routes.
 */
export function validateProjectInput(body: unknown): ValidationResult {
  if (typeof body !== 'object' || body === null) {
    return { error: 'Некоректні дані запиту' };
  }

  const {
    slug,
    shortLabel,
    titleUk,
    titleEn,
    subtitleUk,
    subtitleEn,
    contextUk,
    contextEn,
    leadUk,
    leadEn,
    roleUk,
    roleEn,
    stack,
    statusUk,
    statusEn,
    yearLabel,
    externalUrl,
    linkLabelUk,
    linkLabelEn,
    linkNoteUk,
    linkNoteEn,
    order,
    featured,
    published,
    sections,
  } = body as Record<string, unknown>;

  if (typeof slug !== 'string' || !SLUG_PATTERN.test(slug)) {
    return { error: 'Slug має містити лише малі літери, цифри та дефіси' };
  }

  if (!isNonEmptyString(shortLabel)) return { error: "Поле «Коротка мітка» обов'язкове" };
  if (!isNonEmptyString(titleUk)) return { error: "Поле «Назва (UA)» обов'язкове" };
  if (!isNonEmptyString(titleEn)) return { error: "Поле «Назва (EN)» обов'язкове" };
  if (!isNonEmptyString(subtitleUk)) return { error: "Поле «Підзаголовок (UA)» обов'язкове" };
  if (!isNonEmptyString(subtitleEn)) return { error: "Поле «Підзаголовок (EN)» обов'язкове" };
  if (!isNonEmptyString(contextUk)) return { error: "Поле «Контекст (UA)» обов'язкове" };
  if (!isNonEmptyString(contextEn)) return { error: "Поле «Контекст (EN)» обов'язкове" };
  if (!isNonEmptyString(leadUk)) return { error: "Поле «Лід (UA)» обов'язкове" };
  if (!isNonEmptyString(leadEn)) return { error: "Поле «Лід (EN)» обов'язкове" };
  if (!isNonEmptyString(roleUk)) return { error: "Поле «Роль (UA)» обов'язкове" };
  if (!isNonEmptyString(roleEn)) return { error: "Поле «Роль (EN)» обов'язкове" };

  if (typeof order !== 'number' || !Number.isInteger(order)) {
    return { error: 'Порядок має бути цілим числом' };
  }

  const normalizedUrl = optionalText(externalUrl);

  if (normalizedUrl !== null && !/^https?:\/\//.test(normalizedUrl)) {
    return { error: 'Посилання має починатися з http:// або https://' };
  }

  const normalizedSections = validateSections(sections);

  if (typeof normalizedSections === 'string') {
    return { error: normalizedSections };
  }

  return {
    data: {
      slug,
      shortLabel: shortLabel.trim(),
      titleUk: titleUk.trim(),
      titleEn: titleEn.trim(),
      subtitleUk: subtitleUk.trim(),
      subtitleEn: subtitleEn.trim(),
      contextUk: contextUk.trim(),
      contextEn: contextEn.trim(),
      leadUk: leadUk.trim(),
      leadEn: leadEn.trim(),
      roleUk: roleUk.trim(),
      roleEn: roleEn.trim(),
      stack: optionalText(stack),
      statusUk: optionalText(statusUk),
      statusEn: optionalText(statusEn),
      yearLabel: optionalText(yearLabel),
      externalUrl: normalizedUrl,
      linkLabelUk: optionalText(linkLabelUk),
      linkLabelEn: optionalText(linkLabelEn),
      linkNoteUk: optionalText(linkNoteUk),
      linkNoteEn: optionalText(linkNoteEn),
      order,
      featured: featured === true,
      published: published !== false,
      sections: normalizedSections,
    },
  };
}
