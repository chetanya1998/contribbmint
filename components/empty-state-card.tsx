import Link from 'next/link';

export function EmptyStateCard({ title, description, actionHref, actionLabel }: { title: string; description: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="card p-6 text-center">
      <p className="text-lg font-semibold text-slate-900">{title}</p>
      <p className="text-sm text-slate-600 mt-2">{description}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="mt-3 inline-block px-4 py-2 rounded-full bg-accent text-white text-sm font-medium">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
