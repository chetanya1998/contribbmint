import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { buildProjectInsights } from '@/lib/insights';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const insights = await buildProjectInsights(project, role);
  return NextResponse.json(insights);
}
