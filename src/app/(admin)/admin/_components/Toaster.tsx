'use client';

import { CircleCheck, Info, LoaderCircle, OctagonX, TriangleAlert } from 'lucide-react';
import { Toaster as SonnerToaster } from 'sonner';

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <SonnerToaster
      theme="light"
      className="toaster group"
      position="top-center"
      icons={{
        success: <CircleCheck className="h-4 w-4" />,
        info: <Info className="h-4 w-4" />,
        warning: <TriangleAlert className="h-4 w-4" />,
        error: <OctagonX className="h-4 w-4" />,
        loading: <LoaderCircle className="h-4 w-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'rounded-none border border-[#aba582]/40 bg-red-400 text-green shadow-none px-5 py-4',
          title: 'font-serif text-sm text-[#432b1b]',
          description: 'text-xs text-[#7e654d]',
          actionButton: 'bg-[#432b1b] text-[#eee8d7] rounded-none px-3 py-1 text-xs',
          cancelButton:
            'bg-transparent text-[#7e654d] border border-[#aba582]/40 rounded-none px-3 py-1 text-xs',
          closeButton: 'border border-[#aba582]/40 bg-[#eee8d7] text-[#432b1b]',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
