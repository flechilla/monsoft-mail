import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { threads, emails, emailAccounts } from '@/lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const [thread] = await db.select().from(threads).where(eq(threads.id, id)).limit(1);
  if (!thread) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Verify ownership
  const [account] = await db
    .select()
    .from(emailAccounts)
    .where(and(eq(emailAccounts.id, thread.accountId), eq(emailAccounts.userId, session.user.id)))
    .limit(1);

  if (!account) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const threadEmails = await db
    .select()
    .from(emails)
    .where(eq(emails.threadId, id))
    .orderBy(asc(emails.createdAt));

  return NextResponse.json({ thread, emails: threadEmails });
}
