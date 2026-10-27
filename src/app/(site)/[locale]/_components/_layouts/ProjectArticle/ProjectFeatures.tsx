type Props = {
  features: string[];
};

export function ProjectFeatures({ features }: Props) {
  return (
    <ol
      data-component="ProjectFeatures"
      role="list"
      className="grid list-none gap-y-1 pt-2 sm:grid-cols-1"
    >
      {features.map((feature, index) => (
        <li
          key={feature}
          className="text-app-muted border-app-line-gray flex items-baseline gap-4 border-t py-1 text-base tracking-wide last:border-b last:pb-2"
        >
          <span
            aria-hidden="true"
            className="text-app-muted min-w-[2ch] shrink-0 font-mono text-xs tabular-nums"
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="min-w-0">{feature}</span>
        </li>
      ))}
    </ol>
  );
}
