import { cn } from '@/lib/utils';
import { AppLink } from '@/app/(site)/[locale]/_components/_ui/AppLink';

type Props = {
  open: boolean;
  links: { href: string; label: string; internal?: boolean }[];
  className?: string;
};

export function ProjectLinks({ open, links, className }: Props) {
  return (
    <div
      className={cn(
        'relative inline-flex grow-0 flex-wrap gap-x-8 gap-y-1.5 [grid-area:links]',
        open ? 'my-10' : 'mt-10 mb-6 md:mb-0',
        className
      )}
    >
      {links.map((link) => (
        <AppLink
          key={link.label}
          href={link.href}
          external={!link.internal}
          internal={link.internal}
          arrow="upRight"
          color="blueBright"
          variant="underline"
        >
          {link.label}
        </AppLink>
      ))}
    </div>
  );
}
