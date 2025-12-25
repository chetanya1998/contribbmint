interface MetricTilesProps {
  items: { label: string; value: string | number; helper?: string }[];
}

export function MetricTiles({ items }: MetricTilesProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((item) => (
        <div key={item.label} className="card p-4">
          <p className="text-sm text-slate-500">{item.label}</p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">{item.value}</p>
          {item.helper && <p className="text-xs text-slate-500 mt-1">{item.helper}</p>}
        </div>
      ))}
    </div>
  );
}
