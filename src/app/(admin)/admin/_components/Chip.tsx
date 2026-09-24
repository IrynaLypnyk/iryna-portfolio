'use client';

type ChipProps = {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChangeAction: (checked: boolean) => void;
};

export function Chip({ label, checked, disabled = false, onChangeAction }: ChipProps) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-300 px-2.5 py-1 text-xs font-medium transition-colors select-none ${disabled ? 'cursor-not-allowed opacity-40' : ''} ${checked ? 'bg-neutral-100' : 'hover:bg-neutral-100'}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChangeAction(e.target.checked)}
        className="sr-only"
      />
      {checked && <span aria-hidden>✓</span>}
      {label}
    </label>
  );
}
