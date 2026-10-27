import { MobileMenuContainer } from '@/components/MobileMenuContainer';
import { SiteNav } from './SiteNav';

type Props = {
  isMenuOpen: boolean;
  activeId: string;
  closeMobileMenu: () => void;
};

export function MobileNav({ isMenuOpen, activeId, closeMobileMenu }: Props) {
  return (
    <MobileMenuContainer isMenuOpen={isMenuOpen}>
      <div data-component="MobileNav" className="mb-auto px-10 pb-10">
        <SiteNav activeId={activeId} variant="mobile" onNavigateAction={closeMobileMenu} />
      </div>
    </MobileMenuContainer>
  );
}
