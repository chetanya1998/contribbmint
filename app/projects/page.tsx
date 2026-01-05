import { prisma } from '@/lib/prisma';
import { ProjectCard } from '@/components/projects/project-card';
import { ProjectSearch } from '@/components/projects/project-search';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage({ searchParams }: { searchParams: { search?: string, filter?: string } }) {
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

  const projects = await prisma.project.findMany({
    where,
    take: 50,
    orderBy: { stars: 'desc' }
  });

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
      {projects.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-500">No projects found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
