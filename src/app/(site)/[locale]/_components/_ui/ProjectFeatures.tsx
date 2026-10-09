import { ArrowRight } from 'lucide-react';

type Props = {
  features: string[];
};

export function ProjectFeatures({ features }: Props) {
  return (
    <ul data-component="ProjectFeatures" className="grid gap-y-1 pt-2 text-sm sm:grid-cols-1">
      {features.map((feature) => (
        <li
          key={feature}
          className="text-app-muted border-app-violet-light flex items-start gap-1 border-t-2 py-1 text-sm tracking-wide last:border-b-2 last:pb-2"
        >
          <ArrowRight strokeWidth={1.5} className="text-app-muted w-3 shrink-0" />
          {feature}
        </li>
      ))}
    </ul>
  );
}
