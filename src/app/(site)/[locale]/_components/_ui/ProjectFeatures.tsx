type Props = {
  features: string[];
};

export function ProjectFeatures({ features }: Props) {
  return (
    <ul data-component="ProjectFeatures" className="grid gap-y-1 pt-2 sm:grid-cols-1">
      {features.map((feature) => (
        <li
          key={feature}
          className="text-app-muted border-app-violet-light flex items-start gap-1 border-t-2 py-1 text-base tracking-wide last:border-b-2 last:pb-2"
        >
          {feature}
        </li>
      ))}
    </ul>
  );
}
