type Props = {
  items: readonly string[];
};

/** Shared presentation for project technologies, including the admin preview. */
export function ProjectStack({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <span
      data-component="ProjectStack"
      className="inline-flex flex-wrap items-center gap-x-3 gap-y-1"
    >
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className="inline-flex items-center gap-3">
          {index > 0 && (
            <span aria-hidden="true" className="bg-app-muted h-0.5 w-0.5 shrink-0 rounded-full" />
          )}
          <span>{item}</span>
        </span>
      ))}
    </span>
  );
}
