import { z } from 'zod';
import { DetailPageStatus } from '@/generated/prisma/enums';
import { nullableText } from './text';

export const optionalText = z.string().nullable().transform(nullableText).optional();
export const requiredText = z.string().trim().min(1, 'This field is required.');
export const identifier = requiredText;
export const slug = requiredText.regex(
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  'Use lowercase letters, numbers and single hyphens.'
);
export const optionalWebUrl = optionalText.refine((value) => {
  if (value == null) return true;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !!url.hostname;
  } catch {
    return false;
  }
}, 'Enter a complete HTTP(S) link.');

export const photoInputSchema = z
  .strictObject({
    id: identifier.optional(),
    assetId: identifier.optional(),
    assetUkId: identifier.nullable().optional(),
    captionEn: optionalText,
    captionUk: optionalText,
    descriptionEn: optionalText,
    descriptionUk: optionalText,
    linkUrl: optionalWebUrl,
  })
  .refine((photo) => photo.id !== undefined || photo.assetId !== undefined, {
    message: 'A new media usage requires assetId.',
    path: ['assetId'],
  });

export const contentBlockInputSchema = z.strictObject({
  id: identifier.optional(),
  titleEn: optionalText,
  titleUk: optionalText,
  bodyEn: optionalText,
  bodyUk: optionalText,
  photos: z.array(photoInputSchema).optional(),
});

export const contentFields = {
  detailPageStatus: z.enum(DetailPageStatus).optional(),
  contentBlocks: z.array(contentBlockInputSchema).optional(),
  additionalMedia: z.array(photoInputSchema).optional(),
  coverAssetId: identifier.nullable().optional(),
  coverAssetUkId: identifier.nullable().optional(),
};

export type PhotoInput = z.output<typeof photoInputSchema>;
export type ContentBlockInput = z.output<typeof contentBlockInputSchema>;
export type ContentInput = {
  contentBlocks?: ContentBlockInput[];
  additionalMedia?: PhotoInput[];
  coverAssetId?: string | null;
  coverAssetUkId?: string | null;
};

export function validationResult<T>(result: z.ZodSafeParseResult<T>) {
  if (result.success) return { data: result.data };
  const issue = result.error.issues[0];
  return { error: issue.message, field: issue.path.join('.') || undefined };
}
