import { useTranslations } from 'next-intl';
import { PageContainer } from '@/app/(site)/[locale]/_components/_ui/PageContainer';
import { LocaleSwitcher } from '@/app/(site)/[locale]/_components/_ui/LocaleSwitcher';
import { PLAYLIST_URL, SUPPORT_UKRAINE_URL } from '@/constants/contacts';
import { SupportMark } from '@/app/(site)/[locale]/_components/_ui/SupportMark';
import { TextLink } from '@/app/(site)/[locale]/_components/_ui/TextLink';

export function SiteFooter() {
  const t = useTranslations('Footer');
  const tCommon = useTranslations('Common');

  return (
    <footer data-component="SiteFooter" className="border-app-line bg-app-page border-t">
      <PageContainer className="py-(--section-py) pr-(--page-pad-right) pl-(--page-pad-left)">
        <div className="grid grid-cols-1 items-start gap-5 pb-5.5 sm:grid-cols-2">
          <TextLink href={SUPPORT_UKRAINE_URL} isExternal={true}>
            <SupportMark />
            &nbsp;&nbsp;
            {t('supportUkraine')}
          </TextLink>
          {/*<span className="text-app-muted text-[12.5px]">{t('supportNote')}</span>*/}
          <TextLink href={PLAYLIST_URL} className="sm:ml-auto">
            <span aria-hidden="true" className="text-app-accent">
              ♫
            </span>
            &nbsp;&nbsp;
            {t('soundsTitle')}
          </TextLink>
          {/*<span className="text-app-muted max-w-85 text-[12.5px]">{t('soundsNote')}</span>*/}
        </div>

        <div className="border-app-line flex flex-wrap items-center justify-between gap-5 border-t pt-5">
          <span className="text-app-muted font-mono text-[11.5px]">
            © {new Date().getFullYear()} {tCommon('name')}
          </span>
          <LocaleSwitcher variant="underlined" />
        </div>
      </PageContainer>
    </footer>
  );
}
