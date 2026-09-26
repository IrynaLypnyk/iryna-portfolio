import { ReactNode } from 'react';

export function SectionIntro({ children }: { children: ReactNode }) {
  return (
    <p className="text-app-muted max-w-xl pb-8 text-[17px] leading-[1.6] text-pretty">{children}</p>
  );
}
