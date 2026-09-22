import { ReactNode } from 'react';

type Props = {
  children?: ReactNode;
};

export function FormRow({ children }: Props) {
  return <div className="flex flex-col">{children}</div>;
}
