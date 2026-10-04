import { ReactNode } from 'react';
import Link from 'next/link';
import { routes } from '@/constants/routes';
import { LogoIcon } from '@/assets/icons';

export function Header({
  title,
  nav,
  rightContent,
  logoHref = routes.home,
  containerClass = 'mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-6 py-3',
  headerClass = 'border-app-line bg-app-page/70 sticky top-0 z-10 border-b backdrop-blur-sm',
}: {
  title: ReactNode;
  nav: ReactNode;
  rightContent?: ReactNode;
  logoHref?: string;
  containerClass?: string;
  headerClass?: string;
}) {
  return (
    <header data-component="Header" className={headerClass}>
      <div className={containerClass}>
        <div className="flex items-center gap-3">
          <Link href={logoHref} className="flex items-center gap-2">
            <LogoIcon className="h-10 w-10" />
            {title}
          </Link>
        </div>
        <nav className="flex items-center gap-[clamp(14px,3vw,34px)]">{nav}</nav>
        {rightContent && <div className="flex items-center gap-3">{rightContent}</div>}
      </div>
    </header>
  );
}
