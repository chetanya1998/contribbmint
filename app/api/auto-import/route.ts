import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchMultipleYears } from '@/lib/gsoc-importer';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60s for import

/**
 * Auto-import GSOC projects if database is empty
 * Called automatically by the app on first load
 */
// Allow GET requests for manual triggering via browser/curl
export async function GET(req: NextRequest) {
    return POST(req);
}

export async function POST(req: NextRequest) {
    try {
        // Check if projects already exist
        const existingCount = await prisma.project.count();

        if (existingCount > 0) {
            return NextResponse.json({
                message: 'Projects already exist',
                count: existingCount,
                skipped: true
            });
        }

        console.log('🚀 Auto-importing GSOC organizations...');

        // Fetch organizations from recent years
        const projects = await fetchMultipleYears([2024, 2023, 2022]);

        console.log(`Found ${projects.length} GSOC organizations`);

        // Import to database
        let imported = 0;
        let failed = 0;

        for (const project of projects) {
            try {
                await prisma.project.create({
                    data: {
                        name: project.name,
                        description: project.description,
                        githubUrl: project.githubUrl || `https://github.com/gsoc/${project.name.toLowerCase().replace(/\s+/g, '-')}`,
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
            } catch (error: any) {
                console.error(`Failed to import ${project.name}:`, error.message);
                failed++;
            }
        }

        console.log(`✅ Auto-import complete: ${imported} imported, ${failed} failed`);

        return NextResponse.json({
            success: true,
            imported,
            failed,
            total: projects.length
        });
    } catch (error: any) {
        console.error('Auto-import error:', error);
        return NextResponse.json({
            error: error.message,
            success: false
        }, { status: 500 });
    }
}
