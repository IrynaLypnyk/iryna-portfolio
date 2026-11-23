'use client';
import { ActionBox } from '@/app/(site)/[locale]/_components/_ui/ActionBox';
import { cn } from '@/lib/utils';

type Props = {
  isMenuOpen: boolean;
  toggleMobileMenuAction: () => void;
};

// Colour fades slowly; the X morph uses a slightly overshooting curve (close to the previous spring).
const lineClassName =
  'bg-app-accent-bright group-hover:bg-app-accent-lightest absolute h-0.5 [transition:background-color_500ms,translate_300ms_cubic-bezier(0.34,1.3,0.64,1),rotate_300ms_cubic-bezier(0.34,1.3,0.64,1),width_300ms_cubic-bezier(0.34,1.3,0.64,1)] motion-reduce:transition-none';

export function BurgerMenuButton({ isMenuOpen, toggleMobileMenuAction }: Props) {
  return (
    <ActionBox className={isMenuOpen ? 'bg-app-accent-bright' : ''}>
      <button
        data-component={isMenuOpen ? 'MobileNavigationCloseButton' : 'MobileNavigationOpenButton'}
        onClick={toggleMobileMenuAction}
        type="button"
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-navigation"
        className="group relative flex h-full w-full cursor-pointer items-center justify-center"
      >
        <div className="flex items-center justify-center" aria-hidden="true">
          <div className="relative h-2 w-5">
            <span
              className={cn(
                lineClassName,
                'top-0 right-0',
                isMenuOpen
                  ? 'bg-app-accent-lightest w-[22px] translate-x-px translate-y-[3px] rotate-45'
                  : 'w-5'
              )}
            />

            <span
              className={cn(
                lineClassName,
                'right-0 bottom-0',
                isMenuOpen
                  ? 'bg-app-accent-lightest w-[22px] translate-x-px -translate-y-[3px] -rotate-45'
                  : 'w-5'
              )}
            />
          </div>
        </div>
      </button>
    </ActionBox>
  );
}
