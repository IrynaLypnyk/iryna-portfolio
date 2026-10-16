import { z } from 'zod';
import { ProjectStatus } from '@/generated/prisma/enums';
import {
  contentFields,
  identifier,
  optionalText,
  optionalWebUrl,
  requiredText,
  slug,
  validationResult,
} from '@/lib/content/validation';

const sectionSchema = z.strictObject({
  id: identifier.optional(),
  titleEn: requiredText,
  titleUk: requiredText,
  bodyEn: requiredText,
  bodyUk: requiredText,
  body2En: optionalText,
  body2Uk: optionalText,
});
const collection = z
  .array(z.string())
  .transform((items) => items.map((item) => item.trim()).filter(Boolean));

export const projectCreateSchema = z.strictObject({
  slug,
  titleEn: requiredText,
  titleUk: requiredText,
  shortLabel: optionalText,
  subtitleEn: optionalText,
  subtitleUk: optionalText,
  contextEn: optionalText,
  contextUk: optionalText,
  leadEn: optionalText,
  leadUk: optionalText,
  roleEn: optionalText,
  roleUk: optionalText,
  projectTypeEn: optionalText,
  projectTypeUk: optionalText,
  statusEn: optionalText,
  statusUk: optionalText,
  yearLabel: optionalText,
  externalUrl: optionalWebUrl,
  linkLabelEn: optionalText,
  linkLabelUk: optionalText,
  linkNoteEn: optionalText,
  linkNoteUk: optionalText,
  featuresTitleEn: optionalText,
  featuresTitleUk: optionalText,
  githubUrl: optionalWebUrl,
  storybookUrl: optionalWebUrl,
  status: z.enum(ProjectStatus).optional(),
  stack: collection.optional(),
  featuresEn: collection.optional(),
  featuresUk: collection.optional(),
  order: z.number().int().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  sections: z.array(sectionSchema).optional(),
  ...contentFields,
});

export const projectPatchSchema = projectCreateSchema.partial();
export type ProjectInput = z.output<typeof projectCreateSchema>;
export type ProjectPatchInput = z.output<typeof projectPatchSchema>;
export type ProjectSectionInput = z.output<typeof sectionSchema>;

/** Omission preserves PATCH values; null/blank optional text explicitly clears. */
export function validateProjectInput(body: unknown, mode: 'create' | 'patch' = 'create') {
  return validationResult(
    (mode === 'patch' ? projectPatchSchema : projectCreateSchema).safeParse(body)
  );
}
