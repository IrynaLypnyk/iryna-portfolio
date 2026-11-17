import { getLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { NotFoundContent } from '@/components/NotFoundContent';

export default async function NotFound() {
  const locale = await getLocale();
  return (
    <NotFoundContent locale={hasLocale(routing.locales, locale) ? locale : routing.defaultLocale} />
  );
}
