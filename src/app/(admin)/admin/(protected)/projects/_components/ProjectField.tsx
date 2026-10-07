'use client';

import {
  useId,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { AdminInput } from '../../_components/AdminInput';
import { AdminTextarea } from '../../_components/AdminTextarea';

type Control = HTMLInputElement | HTMLTextAreaElement;

function validationMessage(control: Control) {
  if (control.required && !control.value.trim()) return 'This field is required.';
  if (control instanceof HTMLInputElement && control.type === 'url' && control.value) {
    try {
      const url = new URL(control.value);
      if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) throw new Error();
    } catch {
      return 'Enter a complete link starting with https:// or http://, for example https://example.com.';
    }
  }
  if (control.validity.patternMismatch) return control.title || 'Check the format of this value.';
  return control.validationMessage;
}

/** Also checks whitespace-only required values and HTTP(S) URLs. */
export function validateProjectControl(control: Control) {
  control.setCustomValidity('');
  control.setCustomValidity(validationMessage(control));
}

type Props = {
  multiline?: boolean;
  error?: string;
  onChange?: (event: ChangeEvent<Control>) => void;
} & Omit<
  InputHTMLAttributes<HTMLInputElement> & TextareaHTMLAttributes<HTMLTextAreaElement>,
  'onChange'
>;

export function ProjectField({ multiline, error: serverError, onChange, ...props }: Props) {
  const id = useId();
  const [error, setError] = useState('');
  const message = serverError || error;
  const shared = {
    ...props,
    'aria-invalid': !!message,
    'aria-describedby': message ? id : undefined,
    className: message
      ? 'border-red-600 bg-red-50 hover:border-red-600 focus:border-red-600'
      : undefined,
    onInvalid: (event: React.FormEvent<Control>) => {
      event.preventDefault();
      setError(validationMessage(event.currentTarget));
    },
    onChange: (event: ChangeEvent<Control>) => {
      validateProjectControl(event.currentTarget);
      if (error) setError(validationMessage(event.currentTarget));
      onChange?.(event);
    },
  };

  return (
    <>
      {multiline ? <AdminTextarea {...shared} /> : <AdminInput {...shared} />}
      {message && (
        <span id={id} className="mt-1 block text-sm text-red-700">
          {message}
        </span>
      )}
    </>
  );
}
