/** One representation for unset optional text, including legacy whitespace. */
export function nullableText(value: string | null | undefined): string | null {
  return value?.trim() || null;
}
