import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || undefined;
  const sort = searchParams.get('sort') || 'stars';
  const language = searchParams.get('language') || undefined;

  const orderBy =
    sort === 'updated' ? { lastPushedAt: 'desc' as const } : sort === 'active' ? { lastSyncedAt: 'desc' as const } : { stars: 'desc' as const };

  const projects = await prisma.project.findMany({
    where: {
      status: 'APPROVED',
      OR: search
        ? [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
      primaryLanguage: language || undefined,
    },
    orderBy,
    take: 30,
  });

  return NextResponse.json(projects);
}
