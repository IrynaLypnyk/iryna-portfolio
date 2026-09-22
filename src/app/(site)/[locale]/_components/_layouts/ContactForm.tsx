'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AccentButton } from '@/app/(site)/[locale]/_components/_ui/AccentButton';
import { apiRoutes } from '@/constants/routes';
import { ErrorMessage } from '@/app/(site)/[locale]/_components/_ui/form/ErrorMessage';
import { FormLabel } from '@/app/(site)/[locale]/_components/_ui/form/FormLabel';
import { FormRow } from '@/app/(site)/[locale]/_components/_ui/form/FormRow';
import { AppInput } from '@/app/(site)/[locale]/_components/_ui/form/AppInput';
import { AppTextarea } from '@/app/(site)/[locale]/_components/_ui/form/AppTextarea';

type Status = 'idle' | 'sending' | 'success' | 'error';

export function ContactForm() {
  const t = useTranslations('Contact');
  const [status, setStatus] = useState<Status>('idle');

  // Built here rather than at module scope so the messages resolve in the
  // active locale.
  const schema = z.object({
    name: z
      .string()
      .trim()
      .min(1, t('validation.nameRequired'))
      .min(2, {
        message: t('validation.nameMinLength'),
      }),
    email: z
      .string()
      .trim()
      .min(1, t('validation.emailRequired'))
      .email(t('validation.emailInvalid')),
    message: z
      .string()
      .trim()
      .min(1, t('validation.messageRequired'))
      .min(10, {
        message: t('validation.messageMinLength'),
      }),
  });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', message: '' },
  });

  async function onSubmit(values: FormValues) {
    setStatus('sending');

    try {
      const response = await fetch(apiRoutes.contact, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      setStatus('success');
      reset();
    } catch {
      setStatus('error');
    }
  }

  const statusMessage =
    status === 'sending'
      ? t('sending')
      : status === 'success'
        ? t('success')
        : status === 'error'
          ? t('error')
          : '';

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      data-component="ContactForm"
      className="border-app-line bg-app-surface grid gap-4.5 border p-[clamp(22px,3vw,34px)]"
    >
      <FormRow>
        <FormLabel>{t('formName')} </FormLabel>
        <AppInput type="text" autoComplete="name" {...register('name')} />
        {errors.name?.message && <ErrorMessage message={errors.name.message} />}
      </FormRow>

      <FormRow>
        <FormLabel>{t('formEmail')}</FormLabel>
        <AppInput type="email" autoComplete="email" {...register('email')} />
        {errors.email?.message && <ErrorMessage message={errors.email.message} />}
      </FormRow>

      <FormRow>
        <FormLabel>{t('formMessage')} </FormLabel>
        <AppTextarea rows={4} {...register('message')} />
        {errors.message?.message && <ErrorMessage message={errors.message.message} />}
      </FormRow>

      <AccentButton type="submit" disabled={status === 'sending'} className="mt-1.5">
        {t('formSend')}
      </AccentButton>

      <p aria-live="polite" className="text-app-brand m-0 min-h-4.5 text-[13.5px]">
        {statusMessage}
      </p>
    </form>
  );
}
