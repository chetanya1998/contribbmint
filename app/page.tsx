import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ProjectCard } from '@/components/projects/project-card';
import { FilterBar } from '@/components/projects/filter-bar';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { buildProjectInsights } from '@/lib/insights';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getServerSession(authOptions as any);
  const role = (session?.user as any)?.role;
  const projects = await prisma.project.findMany({ where: { status: 'APPROVED' }, take: 6 });

  const projectsWithInsights = await Promise.all(
    projects.map(async (project) => {
      const insights = await buildProjectInsights(project, role);
      return { project, snippet: insights.snippet };
    })
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="card p-6 bg-gradient-to-r from-slate-50 to-white border-slate-100">
        <h1 className="text-3xl font-semibold text-slate-900">ContribMint</h1>
        <p className="text-slate-600 mt-2 max-w-2xl">
          A minimal, role-aware view of open-source activity. Discover projects, track contributions, and align insights for contributors, maintainers, sponsors, and admins.
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/projects" className="px-4 py-2 rounded-full bg-accent text-white text-sm font-medium">Browse projects</Link>
          <Link href="/dashboard" className="px-4 py-2 rounded-full border border-slate-200 text-sm font-medium">View dashboard</Link>
        </div>
      </div>

      <FilterBar />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projectsWithInsights.map(({ project, snippet }) => (
          <ProjectCard
            key={project.id}
            id={project.id}
            name={project.name}
            description={project.description}
            githubOwner={project.githubOwner}
            githubRepo={project.githubRepo}
            tags={project.tags}
            stars={project.stars}
            forks={project.forks}
            openIssuesCount={project.openIssuesCount}
            lastPushedAt={project.lastPushedAt?.toISOString()}
            role={role}
            status={project.status}
            insight={snippet}
          />
        ))}
      </div>
    </div>
  );
}
