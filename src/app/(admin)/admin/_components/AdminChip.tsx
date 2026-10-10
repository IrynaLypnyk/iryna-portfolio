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
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-2xl border px-2 py-2 text-xs font-medium transition-colors select-none ${disabled ? 'cursor-not-allowed opacity-40' : ''} ${checked ? 'bg-app-violet-light border-app-violet text-app-text' : 'border-app-disabled hover:bg-app-warning-light hover:border-app-violet text-app-muted'}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChangeAction(e.target.checked)}
        className="sr-only"
      />
      {checked && (
        <span aria-hidden className="text-app-violet">
          ✓
        </span>
      )}
      {label}
    </label>
  );
}
