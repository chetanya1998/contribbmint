import { RoleBadge } from '../role-badge';

interface ProjectHeaderProps {
  name: string;
  githubUrl: string;
  stars?: number | null;
  forks?: number | null;
  primaryLanguage?: string | null;
  topics?: string[] | null;
  status?: string;
  role?: string;
  actions?: React.ReactNode;
}

export function ProjectHeader({ name, githubUrl, stars, forks, primaryLanguage, topics, status, role, actions }: ProjectHeaderProps) {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{name}</h1>
          <a href={githubUrl} className="text-sm text-accent" target="_blank" rel="noreferrer">
            {githubUrl}
          </a>
        </div>
        <div className="flex items-center gap-2">
          {role && <RoleBadge role={role as any} />}
          {status && status !== 'APPROVED' && (
            <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{status}</span>
          )}
          {actions}
        </div>
      </div>
      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
        <span>⭐ {stars ?? 0}</span>
        <span>🍴 {forks ?? 0}</span>
        {primaryLanguage && <span>{primaryLanguage}</span>}
        {topics?.slice(0, 4).map((topic) => (
          <span key={topic} className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
            {topic}
          </span>
        ))}
      </div>
    </div>
  );
}
