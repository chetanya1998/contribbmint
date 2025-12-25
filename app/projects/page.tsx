import { prisma } from '@/lib/prisma';
import { FilterBar } from '@/components/projects/filter-bar';
import { ProjectCard } from '@/components/projects/project-card';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { buildProjectInsights } from '@/lib/insights';

export const dynamic = 'force-dynamic';

function sortOrder(sort?: string) {
  switch (sort) {
    case 'updated':
      return { lastPushedAt: 'desc' as const };
    case 'active':
      return { lastSyncedAt: 'desc' as const };
    default:
      return { stars: 'desc' as const };
  }
}

export default async function ProjectsPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const session = await getServerSession(authOptions as any);
  const role = (session?.user as any)?.role;
  const search = (searchParams.search as string) || '';
  const sort = (searchParams.sort as string) || 'stars';
  const language = (searchParams.language as string) || undefined;

  const projects = await prisma.project.findMany({
    where: {
      status: 'APPROVED',
      OR: search
        ? [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
      primaryLanguage: language,
    },
    orderBy: sortOrder(sort),
    take: 30,
  });

  const withInsights = await Promise.all(
    projects.map(async (project) => {
      const insights = await buildProjectInsights(project, role);
      return { project, snippet: insights.snippet };
    })
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Open Source Projects</h1>
          <p className="text-sm text-slate-600">Directory of approved projects with lightweight filters.</p>
        </div>
      </div>
      <FilterBar />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {withInsights.map(({ project, snippet }) => (
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
