import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { EmptyStateCard } from '@/components/empty-state-card';
import { Activity, Star, Award, GitMerge, Shield } from 'lucide-react';
import Link from 'next/link';
import { Role } from '@/types/enums';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions as any);
  const user = (session?.user as any);
  const role = user?.role as Role | undefined;

  if (!role) return notFound();

  if (role === 'CONTRIBUTOR') return <ContributorDashboard username={user?.githubUsername} />;
  // Fallbacks for other roles (simplified for this update)
  if (role === 'MAINTAINER') return <MaintainerDashboard userId={user?.id} />;
  if (role === 'ADMIN') return <AdminDashboard />;

  return <div className="text-white">Dashboard not implemented for role: {role}</div>;
}

// Reusable Widget
function StatWidget({ label, value, icon, color }: any) {
  return (
    <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-400`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
      </div>
    </div>
  );
}

async function ContributorDashboard({ username }: { username?: string | null }) {
  const contributions = await prisma.contributionEvent.findMany({ where: { actorGithubUsername: username || '' }, take: 5, orderBy: { occurredAt: 'desc' } });
  const reputations = await prisma.projectReputation.findMany({ where: { githubUsername: username || '' }, include: { project: true } });

  const totalRep = reputations.reduce((sum, r) => sum + r.pointsTotal, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome back, {username}</h1>
        <p className="text-slate-400 mt-2">Here&apos;s your open source impact at a glance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatWidget label="Total Reputation" value={totalRep} icon={<Award size={24} />} color="yellow" />
        <StatWidget label="Contributions" value={contributions.length} icon={<GitMerge size={24} />} color="blue" />
        <StatWidget label="Projects engaged" value={reputations.length} icon={<Activity size={24} />} color="purple" />
      </div>

      <div className="glass-card rounded-3xl p-8">
        <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {contributions.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <div className="flex flex-col">
                <span className="font-semibold text-white">{c.title}</span>
                <span className="text-sm text-slate-400">{new Date(c.occurredAt).toLocaleDateString()}</span>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${c.mintStatus === 'MINTED' ? 'bg-green-500/20 text-green-400' :
                c.mintStatus === 'READY_TO_MINT' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'
                }`}>
                {c.mintStatus.replace('_', ' ')}
              </span>
            </div>
          ))}
          {contributions.length === 0 && <EmptyStateCard title="No contributions yet" description="Start contributing to see your stats grow!" />}
        </div>
        <div className="mt-6">
          <Link href="/dashboard/contributions" className="text-sm text-primary hover:text-primary/80 font-medium">
            View all contributions →
          </Link>
        </div>
      </div>
    </div>
  );
}

async function MaintainerDashboard({ userId }: { userId?: string }) {
  return <div className="text-white">Maintainer Dashboard Refactor Coming Soon...</div>
}
async function AdminDashboard() {
  return <div className="text-white">Admin Dashboard Refactor Coming Soon...</div>
}
