import { z } from 'zod';
import {
  contentFields,
  optionalText,
  optionalWebUrl,
  requiredText,
  slug,
  validationResult,
} from '@/lib/content/validation';

const optionalSummary = z
  .string()
  .nullable()
  .transform((value) => value?.trim() ?? '')
  .optional();

export const experimentCreateSchema = z.strictObject({
  slug,
  titleEn: requiredText,
  titleUk: requiredText,
  descriptionEn: requiredText,
  descriptionUk: requiredText,
  shortDescriptionEn: optionalSummary,
  shortDescriptionUk: optionalSummary,
  stack: optionalText,
  demoUrl: optionalWebUrl,
  githubUrl: optionalWebUrl,
  order: z.number().int().optional(),
  published: z.boolean().optional(),
  ...contentFields,
});

export const experimentPatchSchema = experimentCreateSchema.partial();
export type ExperimentInput = z.output<typeof experimentCreateSchema>;
export type ExperimentPatchInput = z.output<typeof experimentPatchSchema>;

export function validateExperimentInput(body: unknown, mode: 'create' | 'patch' = 'create') {
  return validationResult(
    (mode === 'patch' ? experimentPatchSchema : experimentCreateSchema).safeParse(body)
  );
}
