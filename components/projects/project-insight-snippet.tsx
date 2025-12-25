interface InsightSnippetProps {
  insight?: string | null;
  status?: string | null;
}

export function InsightSnippet({ insight, status }: InsightSnippetProps) {
  if (status && status !== 'APPROVED') {
    return <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">Pending approval</div>;
  }
  return (
    <div className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
      {insight || 'Engage with this project to see personalized insights.'}
    </div>
  );
}
