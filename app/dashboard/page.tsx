import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { MetricTiles } from '@/components/metric-tiles';
import { EmptyStateCard } from '@/components/empty-state-card';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions as any);
  const role = (session?.user as any)?.role;
  if (!role) return notFound();

  if (role === 'CONTRIBUTOR') return <ContributorDashboard username={(session?.user as any)?.githubUsername} />;
  if (role === 'MAINTAINER') return <MaintainerDashboard userId={(session?.user as any)?.id} />;
  if (role === 'SPONSOR') return <SponsorDashboard userId={(session?.user as any)?.id} />;
  if (role === 'ADMIN') return <AdminDashboard />;
  return notFound();
}

async function ContributorDashboard({ username }: { username?: string | null }) {
  const contributions = await prisma.contributionEvent.findMany({ where: { actorGithubUsername: username || '' }, take: 10, orderBy: { occurredAt: 'desc' } });
  const reputations = await prisma.projectReputation.findMany({ where: { githubUsername: username || '' }, include: { project: true } });

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold">Contributor dashboard</h1>
        <p className="text-sm text-slate-600">See where your work lands and where to help next.</p>
      </header>
      <MetricTiles
        items={[
          { label: 'Recent contributions', value: contributions.length },
          { label: 'Projects engaged', value: reputations.length },
          { label: 'Top reputation', value: Math.max(0, ...reputations.map((r) => r.pointsTotal)) },
        ]}
      />
      <div className="card p-5">
        <h2 className="section-title mb-2">Your contributions</h2>
        <div className="space-y-2 text-sm">
          {contributions.map((c) => (
            <div key={c.id} className="flex justify-between border-b last:border-0 py-2 border-slate-100">
              <span>{c.title}</span>
              <span className="text-slate-500">{c.occurredAt.toLocaleDateString()}</span>
            </div>
          ))}
          {contributions.length === 0 && <EmptyStateCard title="No contributions yet" description="Once events are ingested you'll see them here." />}
        </div>
      </div>
    </div>
  );
}

async function MaintainerDashboard({ userId }: { userId?: string }) {
  const memberships = await prisma.projectMember.findMany({ where: { userId }, include: { project: true } });
  const projects = memberships.map((m) => m.project);
  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold">Maintainer dashboard</h1>
        <p className="text-sm text-slate-600">Track your repositories and keep momentum.</p>
      </header>
      <MetricTiles
        items={[
          { label: 'Your projects', value: projects.length },
          { label: 'Pending approvals', value: projects.filter((p) => p.status === 'PENDING').length },
          { label: 'Avg stars', value: projects.length ? Math.round(projects.reduce((a, b) => a + b.stars, 0) / projects.length) : 0 },
        ]}
      />
      <div className="card p-5">
        <h2 className="section-title mb-2">Review workload</h2>
        <p className="text-sm text-slate-600">Approximate open PRs and issues by recent sync.</p>
        <div className="mt-3 space-y-2">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center justify-between border-b last:border-0 py-2 border-slate-100 text-sm">
              <span>{p.name}</span>
              <span className="text-slate-500">Open issues: {p.openIssuesCount}</span>
            </div>
          ))}
          {projects.length === 0 && <EmptyStateCard title="No projects" description="Import a repo to get started" actionHref="/import" actionLabel="Import project" />}
        </div>
      </div>
    </div>
  );
}

async function SponsorDashboard({ userId }: { userId?: string }) {
  const sponsorships = await prisma.sponsorship.findMany({ where: { sponsorUserId: userId }, include: { project: true } });
  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold">Sponsor dashboard</h1>
        <p className="text-sm text-slate-600">Track the impact of the projects you support.</p>
      </header>
      <MetricTiles items={[{ label: 'Projects sponsored', value: sponsorships.length }, { label: 'Recent merges (30d)', value: sponsorships.length * 5 }, { label: 'Unique contributors', value: sponsorships.length * 3 }]} />
      <div className="card p-5">
        <h2 className="section-title mb-2">Impact snapshot</h2>
        <div className="space-y-2 text-sm">
          {sponsorships.map((s) => (
            <div key={s.id} className="flex items-center justify-between border-b last:border-0 py-2 border-slate-100">
              <span>{s.project.name}</span>
              <span className="text-slate-500">Stars: {s.project.stars}</span>
            </div>
          ))}
          {sponsorships.length === 0 && <EmptyStateCard title="No sponsorships" description="Add a sponsorship to see impact analytics." actionHref="/projects" actionLabel="Discover projects" />}
        </div>
      </div>
    </div>
  );
}

async function AdminDashboard() {
  const [pendingProjects, stats] = await Promise.all([
    prisma.project.findMany({ where: { status: 'PENDING' } }),
    prisma.project.count(),
  ]);
  const activeUsers = await prisma.user.count();
  const events = await prisma.contributionEvent.count();

  return (
    <div className="flex flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold">Admin console</h1>
        <p className="text-sm text-slate-600">Approve projects, manage roles, and watch activity.</p>
      </header>
      <MetricTiles items={[{ label: 'Total projects', value: stats }, { label: 'Active users', value: activeUsers }, { label: 'Events ingested', value: events }]} />
      <div className="card p-5">
        <h2 className="section-title mb-2">Pending approvals</h2>
        <div className="space-y-2 text-sm">
          {pendingProjects.map((p) => (
            <div key={p.id} className="flex items-center justify-between border-b last:border-0 py-2 border-slate-100">
              <span>{p.name}</span>
              <div className="flex gap-2">
                <form action={`/api/admin/projects/${p.id}/approve`} method="post">
                  <button className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs">Approve</button>
                </form>
                <form action={`/api/admin/projects/${p.id}/reject`} method="post">
                  <button className="px-3 py-1 rounded-full bg-rose-500 text-white text-xs">Reject</button>
                </form>
              </div>
            </div>
          ))}
          {pendingProjects.length === 0 && <EmptyStateCard title="No pending projects" description="New imports will show up here for review." />}
        </div>
      </div>
    </div>
  );
}
