import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { threads, emailAccounts } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('accountId');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = (page - 1) * limit;

  let where;
  if (accountId) {
    where = eq(threads.accountId, accountId);
  } else {
    const userAccounts = await db
      .select({ id: emailAccounts.id })
      .from(emailAccounts)
      .where(eq(emailAccounts.userId, session.user.id));
    const accountIds = userAccounts.map((a) => a.id);
    if (accountIds.length === 0) return NextResponse.json({ threads: [], total: 0 });
    where = sql`${threads.accountId} IN (${sql.join(accountIds.map(id => sql`${id}`), sql`, `)})`;
  }

  const [result, countResult] = await Promise.all([
    db.select().from(threads).where(where).orderBy(desc(threads.lastMessageAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(threads).where(where),
  ]);

  return NextResponse.json({
    threads: result,
    total: Number(countResult[0].count),
    page,
    limit,
  });
}
