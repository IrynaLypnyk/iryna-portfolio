import { ArrowRight } from 'lucide-react';

type Props = {
  features: string[];
};

/** Two-column "Key features" bullet grid shown inside an expanded project card. */
export function ProjectFeatures({ features }: Props) {
  return (
    <ul
      data-component="ProjectFeatures"
      className="grid gap-x-3 gap-y-2 text-[15px] sm:grid-cols-2"
    >
      {features.map((feature) => (
        <li key={feature} className="text-app-muted flex items-start gap-2">
          <ArrowRight strokeWidth={1.5} className="text-app-accent-bright w-4 shrink-0" /> {feature}
        </li>
      ))}
    </ul>
  );
}
