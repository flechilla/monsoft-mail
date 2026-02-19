import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emails, emailAccounts, emailLabels } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { sendEmail } from '@/lib/resend/send';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('accountId');
  const labelId = searchParams.get('labelId');
  const isRead = searchParams.get('isRead');
  const direction = searchParams.get('direction');
  const isStarred = searchParams.get('isStarred');
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = (page - 1) * limit;

  const conditions = [];

  if (accountId) {
    conditions.push(eq(emails.accountId, accountId));
  } else {
    // Filter to user's accounts only
    const userAccounts = await db
      .select({ id: emailAccounts.id })
      .from(emailAccounts)
      .where(eq(emailAccounts.userId, session.user.id));
    const accountIds = userAccounts.map((a) => a.id);
    if (accountIds.length === 0) return NextResponse.json({ emails: [], total: 0 });
    conditions.push(sql`${emails.accountId} IN (${sql.join(accountIds.map(id => sql`${id}`), sql`, `)})`);
  }

  if (isRead !== null && isRead !== undefined) {
    conditions.push(eq(emails.isRead, isRead === 'true'));
  }

  if (direction) {
    conditions.push(eq(emails.direction, direction as 'inbound' | 'outbound'));
  }

  if (isStarred !== null && isStarred !== undefined) {
    conditions.push(eq(emails.isStarred, isStarred === 'true'));
  }

  if (status) {
    conditions.push(eq(emails.status, status as 'draft' | 'sent' | 'delivered' | 'failed'));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [result, countResult] = await Promise.all([
    db.select().from(emails).where(where).orderBy(desc(emails.receivedAt), desc(emails.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(emails).where(where),
  ]);

  return NextResponse.json({
    emails: result,
    total: Number(countResult[0].count),
    page,
    limit,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { accountId, to, cc, bcc, subject, html, text, replyTo, inReplyTo, references, threadId } = body;

  // Verify account belongs to user
  const [account] = await db
    .select()
    .from(emailAccounts)
    .where(and(eq(emailAccounts.id, accountId), eq(emailAccounts.userId, session.user.id)))
    .limit(1);

  if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

  const email = await sendEmail({
    accountId,
    to,
    cc,
    bcc,
    subject,
    html,
    text,
    replyTo,
    inReplyTo,
    references,
    threadId,
  });

  return NextResponse.json({ email });
}
