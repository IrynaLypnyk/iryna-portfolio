import { cn } from '@/lib/utils';
import { AppLink } from '@/app/(site)/[locale]/_components/_ui/AppLink';

type Props = { open: boolean; links: { href: string; label: string }[] };

export function ProjectLinks({ open, links }: Props) {
  return (
    <div
      className={cn(
        'relative mt-6 inline-flex flex-wrap gap-x-8 gap-y-1.5 [grid-area:links]',
        open ? 'my-10' : ''
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
