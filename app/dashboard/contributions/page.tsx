import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { VoteButton } from '@/components/voting/vote-button';
import { ClaimButton } from '@/components/minting/claim-button';
import { GitCommit, Star, CheckCircle } from 'lucide-react';

export default async function ContributionsPage() {
    const session = await auth();
    if (!session?.user) return <div className="text-white">Please log in</div>;

    let contributions: any[] = [];
    try {
        contributions = await prisma.contributionEvent.findMany({
            where: {
                projectId: { not: undefined }, // Just filter valid ones
            },
            include: {
                project: true,
                votes: { // Include my vote
                    where: { userId: session.user.id }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    } catch (e) {
        console.error("Contributions fetch failed:", e);
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Contributions</h1>
                <p className="text-slate-400 mt-2">Track, rate, and mint your open source impact.</p>
            </div>

            <div className="grid gap-4">
                {contributions.map((c) => (
                    <div key={c.id} className="glass-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:bg-white/10">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`p-2 rounded-lg bg-white/5 text-slate-300`}>
                                    <GitCommit size={20} />
                                </span>
                                <h3 className="font-bold text-lg text-white">{c.title}</h3>
                            </div>
                            <p className="text-sm text-slate-400 font-mono ml-11">
                                {c.project.name} • <span className="text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-6 ml-11 md:ml-0">
                            {c.mintStatus === 'PENDING_VOTE' && (
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Rate Impact</span>
                                    <VoteButton contributionId={c.id} initialScore={c.votes[0]?.score || 0} />
                                </div>
                            )}

                            {c.mintStatus === 'READY_TO_MINT' && (
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-semibold text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full">Approved</span>
                                    <ClaimButton contributionId={c.id} />
                                </div>
                            )}

                            {c.mintStatus === 'MINTED' && (
                                <span className="flex items-center gap-2 text-green-400 font-bold px-4 py-2 bg-green-500/10 rounded-xl border border-green-500/20">
                                    <CheckCircle size={18} /> Minted
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
