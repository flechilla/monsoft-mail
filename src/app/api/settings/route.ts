import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let settings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, session.user.id),
  });

  if (!settings) {
    const [created] = await db.insert(userSettings).values({
      userId: session.user.id,
      displayName: session.user.name,
    }).returning();
    settings = created;
  }

  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const allowedFields = [
    'displayName', 'emailSignature', 'theme',
    'aiClassification', 'aiReplySuggestions', 'aiComposeTone',
  ] as const;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  for (const field of allowedFields) {
    if (field in body) updates[field] = body[field];
  }

  // Upsert: create if not exists
  const existing = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, session.user.id),
  });

  if (!existing) {
    const [created] = await db.insert(userSettings).values({
      userId: session.user.id,
      ...updates,
    }).returning();
    return NextResponse.json(created);
  }

  const [updated] = await db.update(userSettings)
    .set(updates)
    .where(eq(userSettings.userId, session.user.id))
    .returning();

  return NextResponse.json(updated);
}
