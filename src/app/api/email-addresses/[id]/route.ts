import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userEmailAddresses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const [address] = await db
    .select()
    .from(userEmailAddresses)
    .where(and(eq(userEmailAddresses.id, id), eq(userEmailAddresses.userId, session.user.id)))
    .limit(1);

  if (!address) {
    return NextResponse.json({ error: 'Email address not found' }, { status: 404 });
  }

  await db.delete(userEmailAddresses).where(eq(userEmailAddresses.id, id));

  return NextResponse.json({ ok: true });
}
