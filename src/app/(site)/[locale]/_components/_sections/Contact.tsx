import { useTranslations } from 'next-intl';
import { Kicker } from '@/app/(site)/[locale]/_components/_ui/Kicker';
import { SectionHeader } from '@/app/(site)/[locale]/_components/_ui/SectionHeader';
import { AppLink, AppLinkProps } from '@/app/(site)/[locale]/_components/_ui/AppLink';
import { ContactForm } from '@/app/(site)/[locale]/_components/_layouts/ContactForm';
import { CONTACT_INFO, SOCIAL_LINKS } from '@/constants/contacts';
import { anchors } from '@/constants/routes';
import { Section } from '@/app/(site)/[locale]/_components/_ui/Section';

const contactAppLinkProps = {
  arrow: 'right',
  color: 'black',
  variant: 'underline',
  arrowPosition: 'after',
} satisfies Pick<AppLinkProps, 'arrow' | 'color' | 'variant' | 'arrowPosition'>;

export function Contact() {
  const t = useTranslations('Contact');

  return (
    <Section
      id={anchors.contact}
      // className="pt-[clamp(88px,16vh,196px)] pb-[clamp(64px,10vh,120px)]"
    >
      <SectionHeader index="03" title={t('title')} className="mb-[clamp(40px,7vh,84px)]" />

      <div className="grid items-start gap-[clamp(36px,7vw,96px)] md:grid-cols-2">
        <div className="grid gap-7">
          <div className="grid gap-4.5">
            <Kicker className="tracking-wide">{t('lead')}</Kicker>

            <div className="text-app-accent-bright text-[clamp(28px,3.8vw,52px)] leading-tight font-medium tracking-normal">
              {t('pitch1')}
              <br />
              {t('pitch2')}
              <br />
              {t('pitch3')}
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <AppLink href={`mailto:${CONTACT_INFO.email}`} {...contactAppLinkProps}>
              {t('emailMe')}
            </AppLink>
            <AppLink href={SOCIAL_LINKS.linkedin} external {...contactAppLinkProps}>
              LinkedIn
            </AppLink>
            <AppLink href={SOCIAL_LINKS.github} external {...contactAppLinkProps}>
              GitHub
            </AppLink>
          </div>
        </div>

        <ContactForm />
      </div>
    </Section>
  );
}
