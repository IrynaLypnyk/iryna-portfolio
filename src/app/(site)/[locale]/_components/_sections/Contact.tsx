'use client';
import { useTranslations } from 'next-intl';
import { Kicker } from '@/app/(site)/[locale]/_components/_ui/Kicker';
import { SectionHeader } from '@/app/(site)/[locale]/_components/_ui/SectionHeader';
import { AppLink, AppLinkProps } from '@/app/(site)/[locale]/_components/_ui/AppLink';
import { ContactForm } from '@/app/(site)/[locale]/_components/_layouts/ContactForm';
import { CONTACT_INFO, SOCIAL_LINKS } from '@/constants/contacts';
import { anchors } from '@/constants/routes';
import { Section } from '@/app/(site)/[locale]/_components/_ui/Section';
import { useState } from 'react';

const contactAppLinkProps = {
  arrow: 'right',
  color: 'gray',
  variant: 'underline',
  arrowPosition: 'after',
} satisfies Pick<AppLinkProps, 'arrow' | 'color' | 'variant' | 'arrowPosition'>;

export function Contact() {
  const t = useTranslations('Contact');
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    await navigator.clipboard.writeText(CONTACT_INFO.email);
    setCopied(true);

    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Section
      id={anchors.contact}
      // className="pt-[clamp(88px,16vh,196px)] pb-[clamp(64px,10vh,120px)]"
    >
      <SectionHeader index="04" title={t('title')} className="mb-[clamp(40px,7vh,84px)]" />

      <div className="grid items-start gap-[clamp(36px,7vw,96px)] md:grid-cols-2">
        <div className="grid gap-7">
          <div className="grid gap-4.5">
            <Kicker className="text-app-ink font-medium tracking-wide">{t('lead')}</Kicker>

            <div className="text-app-accent-bright text-[clamp(28px,3.8vw,52px)] leading-tight font-medium tracking-normal">
              {t('pitch1')}
              <br />
              {t('pitch2')}
              <br />
              {t('pitch3')}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-6">
              <AppLink href={SOCIAL_LINKS.linkedin} external {...contactAppLinkProps}>
                LinkedIn
              </AppLink>
              <AppLink href={SOCIAL_LINKS.github} external {...contactAppLinkProps}>
                GitHub
              </AppLink>
              <div className="flex gap-2">
                <AppLink href={`mailto:${CONTACT_INFO.email}`} {...contactAppLinkProps}>
                  {t('emailMe')}
                </AppLink>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="text-app-muted hover:text-app-accent-bright cursor-pointer font-mono text-[9px] tracking-normal uppercase"
                >
                  {copied ? 'Copied' : 'Copy email'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <ContactForm />
      </div>
    </Section>
  );
}
