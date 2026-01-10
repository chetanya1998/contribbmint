import { prisma } from '@/lib/prisma';
import { ProjectHeader } from '@/components/projects/project-header';
import { ProjectInsightsPanel } from '@/components/projects/project-insights-panel';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { buildProjectInsights } from '@/lib/insights';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions as any);
  const role = (session?.user as any)?.role;
  const project = await prisma.project.findUnique({ where: { id: params.id }, include: { reputations: true, events: { orderBy: { occurredAt: 'desc' }, take: 30 }, sponsorships: true, members: true } });
  if (!project || project.status !== 'APPROVED') return notFound();

  const insights = await buildProjectInsights(project, role);

  return (
    <div className="flex flex-col gap-5">
      <ProjectHeader
        name={project.name}
        githubUrl={project.githubUrl}
        stars={project.stars}
        forks={project.forks}
        primaryLanguage={project.primaryLanguage}
        topics={project.topics ? project.topics.split(',') : []}
        status={project.status}
        role={role}
        actions={<PrimaryAction role={role} projectId={project.id} githubUrl={project.githubUrl} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="glass-card p-6 col-span-2">
          <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
          <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{project.description}</p>
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-400">
            <span>Primary language: {project.primaryLanguage || 'n/a'}</span>
            <span>Open issues: {project.openIssuesCount}</span>
            <span>Last pushed: {project.lastPushedAt?.toLocaleDateString() || 'n/a'}</span>
            <span>Last synced: {project.lastSyncedAt?.toLocaleDateString() || 'n/a'}</span>
          </div>
        </section>
        <ProjectInsightsPanel title="Role-based insights" metrics={insights.metrics} cta={<InsightsCTA role={role} projectId={project.id} githubUrl={project.githubUrl} />} />
      </div>

      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Top Contributors</h2>
        <div className="space-y-2 text-sm">
          {project.reputations.slice(0, 10).map((rep) => (
            <div key={rep.id} className="flex items-center justify-between border-b last:border-0 py-3 border-white/5">
              <span className="font-medium text-white">{rep.githubUsername}</span>
              <span className="text-slate-400 font-mono">{rep.pointsTotal} pts</span>
            </div>
          ))}
          {project.reputations.length === 0 && <p className="text-slate-400">No contributors recorded yet.</p>}
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="space-y-2 text-sm">
          {project.events.map((event) => (
            <div key={event.id} className="flex items-center justify-between border-b last:border-0 py-3 border-white/5">
              <div>
                <p className="font-medium text-white">{event.title}</p>
                <p className="text-slate-400 text-xs">{event.eventType} • {event.actorGithubUsername}</p>
              </div>
              <span className="text-slate-500 text-sm">{event.occurredAt.toLocaleDateString()}</span>
            </div>
          ))}
          {project.events.length === 0 && <p className="text-slate-400">No activity yet.</p>}
        </div>
      </div>
    </div>
  );
}

function PrimaryAction({ role, projectId, githubUrl }: { role?: string; projectId: string; githubUrl: string }) {
  if (!role || role === 'CONTRIBUTOR') {
    return (
      <Link href={githubUrl} className="btn-primary" target="_blank">
        View on GitHub
      </Link>
    );
  }
  if (role === 'MAINTAINER') {
    return (
      <form action={`/api/projects/${projectId}/sync`} method="post">
        <button className="btn-secondary">Sync Repository</button>
      </form>
    );
  }
  if (role === 'SPONSOR') {
    return (
      <form action={`/api/projects/${projectId}/sponsor`} method="post">
        <button className="px-4 py-2 rounded-full bg-amber-500 text-white text-sm font-medium">Sponsor project</button>
      </form>
    );
  }
  if (role === 'ADMIN') {
    return (
      <div className="flex gap-2">
        <form action={`/api/admin/projects/${projectId}/approve`} method="post">
          <button className="px-3 py-2 rounded-full bg-emerald-500 text-white text-sm font-medium">Approve</button>
        </form>
        <form action={`/api/admin/projects/${projectId}/reject`} method="post">
          <button className="px-3 py-2 rounded-full bg-rose-500 text-white text-sm font-medium">Reject</button>
        </form>
      </div>
    );
  }
  return null;
}

function InsightsCTA({ role, projectId, githubUrl }: { role?: string; projectId: string; githubUrl: string }) {
  if (!role || role === 'CONTRIBUTOR') {
    return (
      <a href={`${githubUrl}/issues`} target="_blank" rel="noreferrer" className="text-sm text-accent font-medium">
        Start contributing
      </a>
    );
  }
  if (role === 'MAINTAINER') {
    return (
      <a href={`/api/projects/${projectId}/sync`} className="text-sm text-accent font-medium">
        Sync GitHub now
      </a>
    );
  }
  if (role === 'SPONSOR') {
    return (
      <a href={`/api/projects/${projectId}/sponsor`} className="text-sm text-accent font-medium">
        Sponsor this project
      </a>
    );
  }
  if (role === 'ADMIN') {
    return (
      <a href={`/api/admin/projects/${projectId}/approve`} className="text-sm text-accent font-medium">
        Moderate project
      </a>
    );
  }
  return null;
}
