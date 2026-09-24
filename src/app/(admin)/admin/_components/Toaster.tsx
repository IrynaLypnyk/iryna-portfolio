'use client';

import { CircleCheck, Info, LoaderCircle, OctagonX, TriangleAlert } from 'lucide-react';
import { Toaster as SonnerToaster } from 'sonner';

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <SonnerToaster
      theme="light"
      richColors
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
          toast: 'rounded-none border shadow-none px-5 py-4',
          title: 'font-sans text-sm',
          description: 'text-xs',
          actionButton: 'bg-[#432b1b] text-[#eee8d7] rounded-none px-3 py-1 text-xs',
          cancelButton:
            'bg-transparent text-[#7e654d] border border-[#aba582]/40 rounded-none px-3 py-1 text-xs',
          closeButton: 'border',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
