import { prisma } from '@/lib/prisma';
import { ProjectCard } from '@/components/projects/project-card';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await auth();
  const user = session?.user as any;
  const role = user?.role;
  let projects = [];
  try {
    projects = await prisma.project.findMany({ where: { status: 'APPROVED' }, take: 9 });
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    // Fallback to empty array to allow page render
  }

  return (
    <div className="flex flex-col gap-10 py-10">
      <section className="text-center space-y-4 max-w-3xl mx-auto px-4">
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text h-[1.2em]">
          Contribute. Mint. Own.
        </h1>
        <p className="text-xl text-slate-400">
          The first platform that turns your open source contributions into verifiable, tradeable NFTs.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <a href="/projects" className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-slate-200 transition-colors">
            Explore Projects
          </a>
          <a href="https://github.com/chetanya/ContribMint" target="_blank" className="px-8 py-3 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-colors border border-white/10">
            View on GitHub
          </a>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6 px-4">
          <h2 className="text-2xl font-bold text-white">Featured Projects</h2>
          <a href="/projects" className="text-sm text-purple-400 hover:text-purple-300">View all →</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              description={project.description || ''}
              stars={project.stars}
              forks={project.forks}
              owner={project.githubOwner}
              repo={project.githubRepo}
              language={project.primaryLanguage || 'Unknown'}
              tags={project.tags ? project.tags.split(',') : []}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
