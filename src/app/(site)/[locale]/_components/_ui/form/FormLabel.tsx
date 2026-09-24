import { ReactNode } from 'react';

type Props = {
  children?: ReactNode;
  htmlFor?: string;
  required?: boolean;
};

export function FormLabel({ children, htmlFor, required }: Props) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-app-muted font-mono text-[11.5px] tracking-wide uppercase"
    >
      {children}
      {required ? <span className="text-app-danger"> *</span> : null}
    </label>
  );
}
