import { cn } from '@/lib/utils';

type ArrowHorizontalLongProps = {
  direction?: 'left' | 'right';
  width?: number;
  strokeWidth?: number;
  className?: string;
};

export const ArrowHorizontalLong = ({
  direction = 'right',
  width = 50,
  strokeWidth = 1,
  className,
}: ArrowHorizontalLongProps) => (
  <svg
    width={width}
    height="auto"
    viewBox="0 0 160 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    data-component="ArrowHorizontalLong"
    className={cn(
      'overflow-visible transition-all duration-700 ease-out',
      direction === 'left' ? 'rotate-180' : '',
      className
    )}
  >
    <path
      d="M0 12H158M158 12L148 4M158 12L148 20"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);
