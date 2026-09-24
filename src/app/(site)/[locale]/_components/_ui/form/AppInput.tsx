import { type InputHTMLAttributes } from 'react';
import { ErrorMessage } from '@/app/(site)/[locale]/_components/_ui/form/ErrorMessage';
import { cn } from '@/lib/utils';
import { FormLabel } from '@/app/(site)/[locale]/_components/_ui/form/FormLabel';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  errorMessage?: string;
};

export const AppInput = ({
  id,
  label,
  className,
  type = 'email',
  name,
  defaultValue,
  errorMessage,
  ...props
}: InputProps) => (
  <div className="flex flex-col gap-1">
    {label && <FormLabel htmlFor={id}>{label}</FormLabel>}
    <input
      id={id}
      type={type}
      name={name}
      defaultValue={defaultValue}
      className={cn(
        'text-app-ink disabled:text-app-disabled border-0 border-b bg-transparent px-0.5 py-2.5 text-base transition-colors outline-none disabled:cursor-not-allowed',
        errorMessage ? 'border-app-danger' : 'border-app-line focus:border-app-accent'
      )}
      {...props}
    />
    {errorMessage && <ErrorMessage message={errorMessage} />}
  </div>
);
