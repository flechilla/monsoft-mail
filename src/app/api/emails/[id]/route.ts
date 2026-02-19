import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emails, emailAccounts, emailLabels } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const [email] = await db.select().from(emails).where(eq(emails.id, id)).limit(1);

  if (!email) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Verify ownership
  const [account] = await db
    .select()
    .from(emailAccounts)
    .where(and(eq(emailAccounts.id, email.accountId), eq(emailAccounts.userId, session.user.id)))
    .limit(1);

  if (!account) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ email });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const [email] = await db.select().from(emails).where(eq(emails.id, id)).limit(1);
  if (!email) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Verify ownership
  const [account] = await db
    .select()
    .from(emailAccounts)
    .where(and(eq(emailAccounts.id, email.accountId), eq(emailAccounts.userId, session.user.id)))
    .limit(1);

  if (!account) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updates: Record<string, unknown> = {};
  if (body.isRead !== undefined) updates.isRead = body.isRead;
  if (body.isStarred !== undefined) updates.isStarred = body.isStarred;

  const [updated] = await db.update(emails).set(updates).where(eq(emails.id, id)).returning();

  // Handle label assignment
  if (body.labelId) {
    await db.insert(emailLabels).values({ emailId: id, labelId: body.labelId }).onConflictDoNothing();
  }
  if (body.removeLabelId) {
    await db
      .delete(emailLabels)
      .where(and(eq(emailLabels.emailId, id), eq(emailLabels.labelId, body.removeLabelId)));
  }

  return NextResponse.json({ email: updated });
}
