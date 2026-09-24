'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AccentButton } from '@/app/(site)/[locale]/_components/_ui/AccentButton';
import { apiRoutes } from '@/constants/routes';
import { AppInput } from '@/app/(site)/[locale]/_components/_ui/form/AppInput';
import { AppTextarea } from '@/app/(site)/[locale]/_components/_ui/form/AppTextarea';
import { cn } from '@/lib/utils';
import { HeartBlue } from '@/app/(site)/[locale]/_components/_ui/HeartBlue';
import { Spinner } from '@/app/(site)/[locale]/_components/_ui/Spinner';

type Status = 'idle' | 'sending' | 'success' | 'error';

export function ContactForm() {
  const t = useTranslations('Contact');

  const [status, setStatus] = useState<Status>('idle');
  const [submittedName, setSubmittedName] = useState('');

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
      setSubmittedName(values.name);
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

  if (status === 'success') {
    return (
      <div
        data-status="success"
        data-component="ContactForm"
        className="flex min-h-50 items-center justify-center gap-2 p-[clamp(22px,3vw,34px)]"
      >
        <HeartBlue />
        <p className="text-app-accent-bright tracking-wide">
          {t('success', { name: submittedName })}{' '}
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {status === 'sending' && (
        <div className="bg-app-surface/70 absolute inset-0 z-10 flex items-center justify-center">
          <Spinner size={46} />
        </div>
      )}

      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        data-component="ContactForm"
        className="border-app-line bg-app-surface grid gap-4.5 border p-[clamp(22px,3vw,34px)]"
      >
        <div className="flex flex-col gap-8">
          <AppInput
            type="text"
            id="name"
            autoComplete="name"
            {...register('name')}
            label={t('formName')}
            errorMessage={errors.name?.message}
          />

          <AppInput
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            label={t('formEmail')}
            errorMessage={errors.email?.message}
          />

          <AppTextarea
            id="message"
            rows={4}
            {...register('message')}
            label={t('formMessage')}
            errorMessage={errors.message?.message}
          />
          <AccentButton type="submit" disabled={status === 'sending'} className="mt-1.5 self-start">
            {t('formSend')}
          </AccentButton>
        </div>

        {status === 'error' && (
          <p
            data-status="error"
            aria-live="polite"
            className={cn('text-app-danger m-0 min-h-4.5 text-base')}
          >
            {statusMessage}
          </p>
        )}
      </form>
    </div>
  );
}
