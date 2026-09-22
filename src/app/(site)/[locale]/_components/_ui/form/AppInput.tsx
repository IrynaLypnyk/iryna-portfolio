import { type InputHTMLAttributes } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const AppInput = ({ className, type, ...props }: InputProps) => (
  <input
    type={type}
    className={
      'border-app-line text-app-ink focus:border-app-accent border-0 border-b bg-transparent px-0.5 py-2.5 text-base transition-colors outline-none'
    }
    {...props}
  />
);
