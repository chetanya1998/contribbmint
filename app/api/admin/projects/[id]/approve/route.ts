import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!isAdmin(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await prisma.project.update({ where: { id: params.id }, data: { status: 'APPROVED' } });
  return NextResponse.json({ status: 'ok' });
}
