import { MoveRight } from 'lucide-react';

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
        <li key={feature} className="text-app-muted flex items-start gap-2">
          <MoveRight strokeWidth={1} className="text-app-accent-bright w-4" /> {feature}
        </li>
      ))}
    </ul>
  );
}
