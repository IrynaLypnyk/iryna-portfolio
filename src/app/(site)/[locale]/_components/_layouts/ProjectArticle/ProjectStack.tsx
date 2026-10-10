type Props = {
  items: readonly string[];
};

/** Shared presentation for project technologies, including the admin preview. */
export function ProjectStack({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <span
      data-component="ProjectStack"
      className="inline-flex flex-wrap items-center gap-x-2 gap-y-1"
    >
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className="inline-flex items-center gap-2">
          <span>{item}</span>
          {index < items.length - 1 && (
            <span aria-hidden="true" className="bg-app-violet h-0.5 w-0.5 shrink-0 rounded-full" />
          )}
        </span>
      ))}
    </span>
  );
}
