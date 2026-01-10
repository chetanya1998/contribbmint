import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { fetchMultipleYears } from '@/lib/gsoc-importer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    if (userRole !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { years } = body;

        if (!years || !Array.isArray(years)) {
            return NextResponse.json({ error: 'Invalid years array' }, { status: 400 });
        }

        console.log(`Fetching GSOC organizations for years: ${years.join(', ')}`);
        const projects = await fetchMultipleYears(years);

        return NextResponse.json({
            success: true,
            projects,
            count: projects.length
        });
    } catch (error: any) {
        console.error('GSOC Preview Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
