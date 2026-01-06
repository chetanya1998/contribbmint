import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { buildProjectInsights } from '@/lib/insights';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id;
  if (!role) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (role === 'CONTRIBUTOR') {
    const contributions = await prisma.contributionEvent.findMany({ where: { actorGithubUsername: (session?.user as any)?.githubUsername || '' }, take: 10 });
    return NextResponse.json({ role, contributions });
  }
  if (role === 'MAINTAINER') {
    const memberships = await prisma.projectMember.findMany({ where: { userId }, include: { project: true } });
    return NextResponse.json({ role, projects: memberships.map((m) => m.project) });
  }
  if (role === 'SPONSOR') {
    const sponsorships = await prisma.sponsorship.findMany({ where: { sponsorUserId: userId }, include: { project: true } });
    return NextResponse.json({ role, sponsorships });
  }
  if (role === 'ADMIN') {
    const pending = await prisma.project.findMany({ where: { status: 'PENDING' } });
    const stats = {
      totalProjects: await prisma.project.count(),
      activeUsers: await prisma.user.count(),
      events: await prisma.contributionEvent.count(),
    };
    return NextResponse.json({ role, pending, stats });
  }
  return NextResponse.json({ role, insights: await buildProjectInsights(await prisma.project.findFirstOrThrow(), role) });
}
