import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/rbac';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({ role: z.enum(['CONTRIBUTOR', 'MAINTAINER', 'SPONSOR', 'ADMIN']) });

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!isAdmin(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  await prisma.user.update({ where: { id: params.id }, data: { role: parsed.data.role as any } });
  return NextResponse.json({ status: 'ok' });
}
