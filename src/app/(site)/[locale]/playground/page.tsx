import { redirect } from '@/i18n/navigation';
import { anchors, routes } from '@/constants/routes';
import type { LocaleType } from '@/i18n/routing';

type Props = {
  params: Promise<{ locale: LocaleType }>;
};

export default async function PlaygroundPage({ params }: Props) {
  const { locale } = await params;
  redirect({ href: `${routes.home}#${anchors.playground}`, locale });
}
