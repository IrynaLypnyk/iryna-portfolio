import { cn } from '@/lib/utils';

type SpinnerProps = {
  className?: string;
  size?: number;
  color?: 'blue' | 'white';
};

export function Spinner({ className, size = 46, color = 'blue' }: SpinnerProps) {
  return (
    <span
      data-component="Spinner"
      className={cn('relative inline-block overflow-hidden align-middle', className)}
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 51 51"
        preserveAspectRatio="xMidYMid meet"
        focusable="false"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 m-auto origin-center animate-[spinner-svg-rotate_2000ms_linear_infinite] overflow-visible"
      >
        <circle
          cx="50%"
          cy="50%"
          r="23"
          className={cn(
            'origin-center fill-transparent',
            'stroke-[5px]',
            '[stroke-dasharray:144_51326px]',
            'animate-[spinner-circle-rotate_4000ms_cubic-bezier(0.35,0,0.25,1)_infinite]',
            'transition-[stroke] duration-225 ease-linear',
            color === 'blue' ? 'stroke-app-accent-bright' : 'stroke-white'
          )}
        />
      </svg>
    </span>
  );
}
