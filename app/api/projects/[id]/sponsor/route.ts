import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isSponsor } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;
  if (!isSponsor(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.sponsorship.create({ data: { projectId: params.id, sponsorUserId: userId } });
  return NextResponse.json({ status: 'ok' });
}
