'use client';

type ChipProps = {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChangeAction: (checked: boolean) => void;
};

export function AdminChip({ label, checked, disabled = false, onChangeAction }: ChipProps) {
  return (
    <label
      className={`border-app-violet text-app-text inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors select-none ${disabled ? 'cursor-not-allowed opacity-40' : ''} ${checked ? 'bg-app-violet-light' : 'hover:bg-app-violet-light'}`}
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
