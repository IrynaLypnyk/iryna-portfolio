type Props = {
  features: string[];
};

/** Two-column "Key features" bullet grid shown inside an expanded project card. */
export function ProjectFeatures({ features }: Props) {
  return (
    <ul
      data-component="ProjectFeatures"
      className="grid gap-x-6 gap-y-2.5 text-[15px] sm:grid-cols-2"
    >
      {features.map((feature) => (
        <li key={feature} className="text-app-muted flex gap-2.5">
          <span aria-hidden="true" className="bg-app-accent mt-2.5 h-1 w-1 shrink-0 rounded-full" />
          {feature}
        </li>
      ))}
    </ul>
  );
}
