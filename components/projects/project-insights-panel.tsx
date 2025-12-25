import { MetricTiles } from '../metric-tiles';

export interface InsightItem {
  label: string;
  value: string | number;
  helper?: string;
}

export function ProjectInsightsPanel({ title, metrics, cta }: { title: string; metrics: InsightItem[]; cta?: React.ReactNode }) {
  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title">{title}</h2>
        {cta}
      </div>
      <MetricTiles items={metrics} />
    </div>
  );
}
