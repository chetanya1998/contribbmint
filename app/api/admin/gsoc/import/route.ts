import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (userRole !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { projects } = body;

        if (!projects || !Array.isArray(projects)) {
            return NextResponse.json({ error: 'Invalid projects array' }, { status: 400 });
        }

        console.log(`Importing ${projects.length} GSOC organizations...`);

        // Bulk create with upsert to avoid duplicates
        let imported = 0;
        let skipped = 0;

        for (const project of projects) {
            try {
                // Check if project already exists by name
                const existing = await prisma.project.findFirst({
                    where: {
                        OR: [
                            { name: project.name },
                            {
                                AND: [
                                    { githubOwner: project.githubOwner },
                                    { githubRepo: project.githubRepo }
                                ]
                            }
                        ]
                    }
                });

                if (existing) {
                    skipped++;
                    continue;
                }

                await prisma.project.create({
                    data: {
                        name: project.name,
                        description: project.description,
                        githubUrl: project.githubUrl || `https://github.com/${project.githubOwner}/${project.githubRepo}`,
                        githubOwner: project.githubOwner || 'gsoc',
                        githubRepo: project.githubRepo || project.name.toLowerCase().replace(/\s+/g, '-'),
                        tags: project.tags || '',
                        topics: project.topics || '',
                        primaryLanguage: project.primaryLanguage,
                        stars: project.stars,
                        forks: project.forks,
                        openIssuesCount: project.openIssuesCount,
                        status: project.status,
                        source: project.source,
                        gsocYear: project.gsocYear,
                        officialWebsite: project.officialWebsite,
                        chatUrl: project.chatUrl,
                        documentationUrl: project.documentationUrl,
                    }
                });
                imported++;
            } catch (err: any) {
                console.error(`Failed to import ${project.name}:`, err.message);
                skipped++;
            }
        }

        return NextResponse.json({
            success: true,
            imported,
            skipped,
            total: projects.length
        });
    } catch (error: any) {
        console.error('GSOC Import Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
