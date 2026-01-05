import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GithubAdapter } from '@/lib/adapters/github';

const API_KEY = process.env.INGEST_API_KEY || 'dev-secret';

// POST /api/ingest
// Receives standardized contribution data from external adapters/plugins
export async function POST(req: Request) {
    // 1. Auth Check (Basic API Key for now, could be HMAC later)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${API_KEY}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { projectId, activity } = body;
        // activity: { id, title, type, status, authorUsername, url }

        if (!projectId || !activity) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 2. Find internal project ID
        const project = await prisma.project.findFirst({
            where: { OR: [{ id: projectId }, { githubRepo: projectId.split('/')[1] }] }
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // 3. Verify authenticity (Optional double-check)
        const adapter = new GithubAdapter();
        const verified = await adapter.verifyContribution(projectId, activity.id); // For GitHub, id is PR number

        if (!verified) {
            return NextResponse.json({ error: 'Contribution not verified on source' }, { status: 400 });
        }

        // 4. Upsert Contribution Event
        const contribution = await prisma.contributionEvent.upsert({
            where: {
                id: `pr-${activity.id}` // Ideally internal ID logic
            },
            update: {
                mintStatus: 'PENDING_VOTE' // Reset if re-ingesting? Or keep. Logic TBD.
            },
            create: {
                id: `pr-${activity.id}`,
                title: activity.title,
                eventType: activity.type === 'PR' ? 'PR_MERGED' : 'ISSUE_CLOSED',
                targetId: activity.id,
                url: activity.url,
                occurredAt: new Date(),
                projectId: project.id,
                actorGithubUsername: activity.authorUsername,
                mintStatus: 'PENDING_VOTE',
                metadata: JSON.stringify(activity)
            }
        });

        return NextResponse.json({ success: true, id: contribution.id });

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
