import { prisma } from '@/lib/prisma';
import { ProjectCard } from '@/components/projects/project-card';
import { ProjectSearch } from '@/components/projects/project-search';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage({ searchParams }: { searchParams: { search?: string, filter?: string, tab?: string } }) {
  const session = await getServerSession(authOptions as any);
  const role = (session?.user as any)?.role;
  const search = searchParams?.search || '';
  const filter = searchParams?.filter || '';

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } }
    ];
  }
  if (filter === 'good-first-issue') {
    where.topics = { contains: 'good-first-issue' };
  }

  const tab = searchParams?.tab || 'my-projects';

  let projects: any[] = [];
  let error: string | null = null;

  try {
    if (tab === 'discover') {
      // Ingest/Fetch from GitHub
      const { getTrendingProjects } = await import('@/lib/github-ingest');
      projects = await getTrendingProjects();
    } else {
      // Fetch from DB
      projects = await prisma.project.findMany({
        where,
        take: 50,
        orderBy: { stars: 'desc' }
      });
    }
  } catch (e: any) {
    console.error('Projects fetch error:', e);
    error = e.message || 'Failed to load projects';
    projects = [];
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Explore Projects</h1>
          <p className="text-slate-500 mt-2">Find open source projects that reward your contributions.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <ProjectSearch initialSearch={search} />
          {role === 'MAINTAINER' && (
            <Link href="/import" className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition">
              Import Repo
            </Link>
          )}
        </div>
      </div>

      <div className="flex gap-4 mb-8 border-b border-white/10 pb-4">
        <Link
          href="/projects?tab=my-projects"
          className={`px-4 py-2 rounded-lg font-medium transition ${tab !== 'discover' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Tracked Projects
        </Link>
        <Link
          href="/projects?tab=discover"
          className={`px-4 py-2 rounded-lg font-medium transition ${tab === 'discover' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          Discover (GitHub)
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            id={project.id}
            name={project.name}
            description={project.description || ''}
            stars={project.stars}
            forks={project.forks}
            language={project.primaryLanguage || 'Unknown'}
            tags={project.tags ? project.tags.split(',') : []}
            owner={project.githubOwner}
            repo={project.githubRepo}
          />
        ))}
      </div>
      {projects.length === 0 && !error && (
        <div className="text-center py-20">
          <p className="text-slate-400">No projects found matching your criteria.</p>
        </div>
      )}
      {error && (
        <div className="glass-card p-8 text-center border-2 border-red-500/20">
          <p className="text-xl font-bold text-red-400 mb-2">⚠️ Error Loading Projects</p>
          <p className="text-slate-400">{error}</p>
          <p className="text-sm text-slate-500 mt-4">Please check database connection or try again later.</p>
        </div>
      )}
    </div>
  );
}
