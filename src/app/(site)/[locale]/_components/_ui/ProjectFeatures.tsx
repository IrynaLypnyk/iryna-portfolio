// import { Dot } from 'lucide-react';

type Props = {
  features: string[];
};

/** Two-column "Key features" bullet grid shown inside an expanded project card. */
export function ProjectFeatures({ features }: Props) {
  return (
    <ul data-component="ProjectFeatures" className="grid gap-x-3 gap-y-1 text-sm sm:grid-cols-1">
      {features.map((feature) => (
        <li key={feature} className="text-app-muted flex items-start text-sm tracking-wide">
          {/*<Dot strokeWidth={1.5} className="text-app-accent-bright w-3 shrink-0" /> */}
          {feature}
        </li>
      ))}
    </ul>
  );
}
