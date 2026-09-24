import { type TextareaHTMLAttributes } from 'react';
import { FormLabel } from '@/app/(site)/[locale]/_components/_ui/form/FormLabel';
import { ErrorMessage } from '@/app/(site)/[locale]/_components/_ui/form/ErrorMessage';
import { cn } from '@/lib/utils';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  errorMessage?: string;
};

export const AppTextarea = ({
  label,
  id,
  name,
  required,
  errorMessage,
  ...props
}: TextareaProps) => (
  <div className="flex flex-col gap-1">
    {label && (
      <FormLabel htmlFor={id} required={required}>
        {label}
      </FormLabel>
    )}
    <textarea
      id={id}
      name={name}
      className={cn(
        'text-app-ink resize-y border-0 border-b bg-transparent px-0.5 py-2.5 text-base transition-colors outline-none',
        errorMessage ? 'border-app-danger' : 'border-app-line focus:border-app-accent'
      )}
      {...props}
    />
    {errorMessage && <ErrorMessage message={errorMessage} />}
  </div>
);
