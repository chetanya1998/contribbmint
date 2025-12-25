import Link from 'next/link';
import { RoleBadge } from '../role-badge';
import { InsightSnippet } from './project-insight-snippet';

export interface ProjectCardProps {
  id: string;
  name: string;
  description?: string | null;
  githubOwner: string;
  githubRepo: string;
  tags?: string[] | null;
  stars?: number | null;
  forks?: number | null;
  openIssuesCount?: number | null;
  lastPushedAt?: string | null;
  status?: string;
  role?: string;
  insight?: string | null;
}

export function ProjectCard(props: ProjectCardProps) {
  const {
    id,
    name,
    description,
    githubOwner,
    githubRepo,
    tags,
    stars,
    forks,
    openIssuesCount,
    lastPushedAt,
    status,
    role,
    insight,
  } = props;

  return (
    <article className="card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
          <p className="text-sm text-slate-500">{githubOwner}/{githubRepo}</p>
        </div>
        {role && <RoleBadge role={role as any} />}
      </div>
      {description && <p className="text-sm text-slate-600 line-clamp-2">{description}</p>}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 4).map((tag) => (
            <span key={tag} className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 text-xs text-slate-600">
        <span>⭐ {stars ?? 0}</span>
        <span>🍴 {forks ?? 0}</span>
        <span>Issues: {openIssuesCount ?? 0}</span>
        <span>Updated: {lastPushedAt ? new Date(lastPushedAt).toLocaleDateString() : 'n/a'}</span>
      </div>
      <InsightSnippet insight={insight} status={status} />
      <div className="flex items-center justify-between">
        <Link href={`/projects/${id}`} className="text-sm font-medium text-accent">
          View project
        </Link>
        {status && status !== 'APPROVED' && (
          <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {status}
          </span>
        )}
      </div>
    </article>
  );
}
