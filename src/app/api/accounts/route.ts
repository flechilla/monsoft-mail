import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emailAccounts, labels } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const SYSTEM_LABELS = [
  { name: 'Inbox', color: '#4285f4' },
  { name: 'Sent', color: '#34a853' },
  { name: 'Drafts', color: '#fbbc04' },
  { name: 'Spam', color: '#ea4335' },
  { name: 'Trash', color: '#9aa0a6' },
];

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await db
    .select()
    .from(emailAccounts)
    .where(eq(emailAccounts.userId, session.user.id));

  return NextResponse.json({ accounts: result });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { email, name, resendApiKey, domainId } = body;

  if (!email || !name || !resendApiKey) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Check if user has any accounts; if not, make this one default
  const existing = await db
    .select({ id: emailAccounts.id })
    .from(emailAccounts)
    .where(eq(emailAccounts.userId, session.user.id))
    .limit(1);

  const [account] = await db
    .insert(emailAccounts)
    .values({
      userId: session.user.id,
      email,
      name,
      resendApiKey,
      domainId: domainId || null,
      isDefault: existing.length === 0,
    })
    .returning();

  // Create system labels for this account
  await db.insert(labels).values(
    SYSTEM_LABELS.map((l) => ({
      accountId: account.id,
      name: l.name,
      color: l.color,
      type: 'system' as const,
    })),
  );

  return NextResponse.json({ account }, { status: 201 });
}
