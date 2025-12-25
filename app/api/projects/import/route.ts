import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { canManageProjects } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { fetchRepoMetadata } from '@/lib/github';

const schema = z.object({ repoUrl: z.string().url() });

export async function POST(request: Request) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!canManageProjects(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  try {
    const metadata = await fetchRepoMetadata(parsed.data.repoUrl);
    const project = await prisma.project.create({
      data: {
        status: 'PENDING',
        ...metadata,
        topics: metadata.topics || [],
        tags: metadata.topics || [],
        lastPushedAt: metadata.lastPushedAt ? new Date(metadata.lastPushedAt) : null,
      },
    });
    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json({ error: 'GitHub API limit reached or repo not found' }, { status: 400 });
  }
}
