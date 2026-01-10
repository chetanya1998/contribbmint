import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    // Only allow admins to use simulation
    if (userRole !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { action, data } = body;

        if (action === 'create_event') {
            // Create a simulated contribution event
            const { projectId, githubUsername, title } = data;

            const event = await prisma.contributionEvent.create({
                data: {
                    projectId,
                    eventType: 'PR_MERGED',
                    actorGithubUsername: githubUsername,
                    targetId: `sim-${Date.now()}`,
                    title: title || `Simulated PR: ${githubUsername}`,
                    url: `https://github.com/simulated/pr/${Date.now()}`,
                    occurredAt: new Date(),
                    mintStatus: 'PENDING_VOTE',
                },
            });

            return NextResponse.json({ success: true, event });
        }

        if (action === 'add_votes') {
            // Add multiple votes to a contribution
            const { contributionEventId, voteCount, averageScore } = data;

            // Get or create dummy users for voting
            const votes = [];
            for (let i = 0; i < voteCount; i++) {
                const dummyUser = await prisma.user.upsert({
                    where: { email: `voter${i}@simulation.local` },
                    update: {},
                    create: {
                        email: `voter${i}@simulation.local`,
                        name: `Simulated Voter ${i}`,
                        githubUsername: `sim-voter-${i}`,
                        role: 'CONTRIBUTOR',
                    },
                });

                const vote = await prisma.vote.create({
                    data: {
                        contributionEventId,
                        userId: dummyUser.id,
                        score: Math.round(averageScore + (Math.random() - 0.5) * 2), // Random variance
                    },
                });
                votes.push(vote);
            }

            // Calculate if consensus reached (e.g., 3+ votes with avg >= 3)
            if (voteCount >= 3 && averageScore >= 3) {
                await prisma.contributionEvent.update({
                    where: { id: contributionEventId },
                    data: { mintStatus: 'READY_TO_MINT' },
                });
            }

            return NextResponse.json({ success: true, votes, voteCount });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        console.error('Simulation API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
