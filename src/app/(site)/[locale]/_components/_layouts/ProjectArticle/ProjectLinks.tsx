import { cn } from '@/lib/utils';
import { AppLink } from '@/app/(site)/[locale]/_components/_ui/AppLink';

type Props = { open: boolean; links: { href: string; label: string }[] };

export function ProjectLinks({ open, links }: Props) {
  return (
    <div
      className={cn(
        'relative mt-6 mb-6 inline-flex grow-0 flex-wrap gap-x-8 gap-y-1.5 [grid-area:links] md:mb-0',
        open ? 'my-10 md:my-10' : ''
      )}
    >
      {links.map((link) => (
        <AppLink
          key={link.label}
          href={link.href}
          external
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
