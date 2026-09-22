import { ReactNode } from 'react';

type Props = {
  children?: ReactNode;
};

export function FormLabel({ children }: Props) {
  return (
    <div className="text-app-muted font-mono text-[11.5px] tracking-[0.09em] uppercase">
      {children}
    </div>
  );
}
