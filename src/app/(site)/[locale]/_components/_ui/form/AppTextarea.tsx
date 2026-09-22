import { type TextareaHTMLAttributes } from 'react';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const AppTextarea = (props: TextareaProps) => (
  <textarea
    className={
      'border-app-line text-app-ink focus:border-app-accent resize-y border-0 border-b bg-transparent px-0.5 py-2.5 text-base transition-colors outline-none'
    }
    {...props}
  />
);
