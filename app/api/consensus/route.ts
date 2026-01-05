import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { contributionId, score } = body;

    if (!contributionId || typeof score !== 'number' || score < 1 || score > 5) {
        return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    try {
        // Upsert vote
        await prisma.vote.upsert({
            where: {
                contributionEventId_userId: {
                    contributionEventId: contributionId,
                    userId: session.user.id,
                },
            },
            update: { score },
            create: {
                contributionEventId: contributionId,
                userId: session.user.id,
                score,
            },
        });

        // Simple Consensus Check
        const votes = await prisma.vote.findMany({
            where: { contributionEventId: contributionId },
        });

        // If 2+ votes and average >= 3, mark as ready (Low threshold for MVP demo)
        const avgScore = votes.reduce((a, b) => a + b.score, 0) / votes.length;

        if (votes.length >= 2 && avgScore >= 3) {
            await prisma.contributionEvent.update({
                where: { id: contributionId },
                data: { mintStatus: 'READY_TO_MINT' },
            });
        }

        return NextResponse.json({ success: true, avgScore });
    } catch (error) {
        console.error('Consensus Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
