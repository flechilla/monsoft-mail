import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userDomains, userEmailAddresses } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { domainId, localPart, displayName } = await req.json();

  if (!domainId || !localPart) {
    return NextResponse.json({ error: 'domainId and localPart are required' }, { status: 400 });
  }

  // Verify domain belongs to user and is verified
  const [domain] = await db
    .select()
    .from(userDomains)
    .where(and(eq(userDomains.id, domainId), eq(userDomains.userId, session.user.id)))
    .limit(1);

  if (!domain) {
    return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
  }

  if (domain.status !== 'verified') {
    return NextResponse.json({ error: 'Domain is not verified' }, { status: 400 });
  }

  const emailAddress = `${localPart}@${domain.domainName}`;

  // Check for existing addresses to determine default
  const existing = await db
    .select({ id: userEmailAddresses.id })
    .from(userEmailAddresses)
    .where(eq(userEmailAddresses.userId, session.user.id))
    .limit(1);

  const [address] = await db
    .insert(userEmailAddresses)
    .values({
      userId: session.user.id,
      domainId,
      emailAddress,
      displayName: displayName || null,
      isDefault: existing.length === 0,
    })
    .returning();

  return NextResponse.json({ emailAddress: address }, { status: 201 });
}
