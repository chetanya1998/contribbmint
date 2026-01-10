import { prisma } from '@/lib/prisma';
import { ProjectCard } from '@/components/projects/project-card';
import { auth } from '@/lib/auth';
import { StepCard } from '@/components/home/StepCard';
import { FeatureCard } from '@/components/home/FeatureCard';
import { StatCounter } from '@/components/home/StatCounter';

export const dynamic = 'force-dynamic';

const steps = [
  {
    number: 1,
    icon: "🔍",
    title: "Discover Projects",
    description: "Browse real GSOC organizations and find projects that match your skills",
    details: "Filter by technology, difficulty, or topic. Each project shows stats, recent activity, and contribution guidelines."
  },
  {
    number: 2,
    icon: "💻",
    title: "Make Contributions",
    description: "Submit pull requests and contribute code to open-source projects",
    details: "Your GitHub activity is automatically tracked. PRs, issues, and commits are recorded on-chain for verification."
  },
  {
    number: 3,
    icon: "🗳️",
    title: "Community Votes",
    description: "Peers review and vote on the quality of your contribution",
    details: "Consensus mechanism ensures fairness. 3+ votes with avg ≥3 stars triggers NFT eligibility."
  },
  {
    number: 4,
    icon: "🎨",
    title: "Mint Your NFT",
    description: "Claim an NFT proving your verified open-source contribution",
    details: "NFT contains contribution metadata, project info, and community rating. Tradeable on OpenSea."
  }
];

const features = [
  {
    icon: "✅",
    title: "Verified Contributions",
    description: "Cryptographically signed proof of your work",
    status: "ACTIVE" as const
  },
  {
    icon: "🎨",
    title: "NFT Rewards",
    description: "On-chain certificates minted as ERC-721 tokens",
    status: "ACTIVE" as const
  },
  {
    icon: "🗳️",
    title: "Peer Voting",
    description: "Decentralized quality assessment by the community",
    status: "ACTIVE" as const
  },
  {
    icon: "📊",
    title: "Reputation System",
    description: "Track your contributions across all projects",
    status: "ACTIVE" as const
  },
  {
    icon: "🔗",
    title: "GitHub Integration",
    description: "Seamless connection to your GitHub activity",
    status: "ACTIVE" as const
  },
  {
    icon: "💰",
    title: "Sponsorship",
    description: "Fund projects and reward top contributors",
    status: "PLANNED" as const
  }
];

export default async function HomePage() {
  const session = await auth();
  const user = session?.user as any;

  let projects = [];
  let stats = {
    totalProjects: 0,
    totalContributors: 0,
    nftsMinted: 0,
    activeVotes: 0
  };
  let autoImporting = false;

  try {
    // Check if database is empty and trigger auto-import
    const projectCount = await prisma.project.count({ where: { status: 'APPROVED' } });

    if (projectCount === 0) {
      console.log('No projects found, triggering auto-import...');
      autoImporting = true;

      // Trigger async import (don't wait for it)
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auto-import`, {
        method: 'POST'
      }).catch(err => console.error('Auto-import trigger failed:', err));
    }

    projects = await prisma.project.findMany({
      where: { status: 'APPROVED' },
      take: 6,
      orderBy: { stars: 'desc' }
    });

    // Fetch real stats
    const [totalProjectCount, userCount, contributionCount, voteCount] = await Promise.all([
      prisma.project.count({ where: { status: 'APPROVED' } }),
      prisma.user.count(),
      prisma.contributionEvent.count({ where: { mintStatus: 'MINTED' } }),
      prisma.vote.count()
    ]);

    stats = {
      totalProjects: projectCount,
      totalContributors: userCount,
      nftsMinted: contributionCount,
      activeVotes: voteCount
    };
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }

  return (
    <div className="flex flex-col gap-20 py-10">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto px-4 mt-8">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
          Turn Your <span className="text-primary">Open Source</span> Contributions into NFTs
        </h1>
        <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed">
          The first decentralized marketplace for verified contributions to Google Summer of Code projects.
          Contribute, get validated by peers, and mint your proof of work.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
          <a href="/projects" className="btn-primary text-lg px-8 py-4">
            Explore GSOC Projects
          </a>
          <a href="/dashboard" className="btn-secondary text-lg px-8 py-4">
            View Dashboard
          </a>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Four simple steps to turn your contributions into verifiable, tradeable NFTs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {steps.map((step) => (
            <StepCard key={step.number} {...step} />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 bg-white/[0.02] py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Platform Features</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Everything you need to showcase and monetize your open-source work
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4">
        <div className="glass-card p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCounter end={stats.totalProjects} label="GSOC Projects" suffix="+" />
            <StatCounter end={stats.totalContributors} label="Contributors" suffix="+" />
            <StatCounter end={stats.nftsMinted} label="NFTs Minted" />
            <StatCounter end={stats.activeVotes} label="Community Votes" />
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section>
        <div className="flex items-center justify-between mb-8 px-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Featured GSOC Projects</h2>
            <p className="text-slate-400">Discover real Google Summer of Code organizations</p>
          </div>
          <a href="/projects" className="text-sm text-primary hover:text-primary/80 font-bold">
            View all →
          </a>
        </div>

        {projects.length > 0 ? (
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
        ) : (
          <div className="mx-4 p-12 rounded-2xl glass-card text-center border-dashed border-2 border-white/10">
            <div className="mb-4 inline-block p-4 rounded-full bg-white/5">
              <span className="text-4xl">{autoImporting ? '⏳' : '🚀'}</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {autoImporting ? 'Importing GSOC Projects...' : 'No Projects Yet'}
            </h3>
            <p className="text-slate-400 max-w-md mx-auto mb-6">
              {autoImporting
                ? 'We\'re fetching real Google Summer of Code organizations. Refresh in a moment!'
                : 'Projects will be imported automatically. Refresh the page to see them.'}
            </p>
            {!autoImporting && (
              <a href="/admin/import-gsoc" className="inline-flex items-center justify-center px-6 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors">
                Manual Import
              </a>
            )}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="px-4">
        <div className="glass-card p-12 text-center border-2 border-primary/20">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            Connect your GitHub account and wallet to start contributing to GSOC projects and earning NFTs
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/login" className="btn-primary text-lg px-10 py-4">
              Sign in with GitHub
            </a>
            <a href="/projects?tab=discover" className="btn-secondary text-lg px-10 py-4">
              Browse Projects
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
