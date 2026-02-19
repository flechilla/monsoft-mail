import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userResendConfigs, userDomains, userEmailAddresses } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { encryptApiKey } from '@/lib/crypto';
import { Resend } from 'resend';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [config] = await db
    .select()
    .from(userResendConfigs)
    .where(eq(userResendConfigs.userId, session.user.id))
    .limit(1);

  if (!config) {
    return NextResponse.json({ hasKey: false, isVerified: false, domains: [], emailAddresses: [] });
  }

  const domains = await db
    .select()
    .from(userDomains)
    .where(eq(userDomains.userId, session.user.id));

  const addresses = await db
    .select()
    .from(userEmailAddresses)
    .where(eq(userEmailAddresses.userId, session.user.id));

  return NextResponse.json({
    hasKey: true,
    isVerified: config.isVerified,
    domains,
    emailAddresses: addresses,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { apiKey } = await req.json();
  if (!apiKey || typeof apiKey !== 'string') {
    return NextResponse.json({ error: 'API key is required' }, { status: 400 });
  }

  // Verify the key by calling Resend
  const resend = new Resend(apiKey);
  let resendDomains;
  try {
    const result = await resend.domains.list();
    if (result.error) throw new Error(result.error.message);
    resendDomains = result.data?.data ?? [];
  } catch (e) {
    return NextResponse.json(
      { error: 'Invalid API key or Resend API error', details: (e as Error).message },
      { status: 400 },
    );
  }

  // Encrypt the key
  const { encrypted, iv, tag } = encryptApiKey(apiKey);

  // Upsert the config
  const [existing] = await db
    .select({ id: userResendConfigs.id })
    .from(userResendConfigs)
    .where(eq(userResendConfigs.userId, session.user.id))
    .limit(1);

  let configId: string;
  if (existing) {
    await db
      .update(userResendConfigs)
      .set({
        resendApiKeyEncrypted: encrypted,
        resendApiKeyIv: iv,
        resendApiKeyTag: tag,
        isVerified: resendDomains.length > 0,
        updatedAt: new Date(),
      })
      .where(eq(userResendConfigs.id, existing.id));
    configId = existing.id;

    // Clear old domains (cascade will clear email addresses too)
    await db.delete(userDomains).where(eq(userDomains.resendConfigId, configId));
  } else {
    const [config] = await db
      .insert(userResendConfigs)
      .values({
        userId: session.user.id,
        resendApiKeyEncrypted: encrypted,
        resendApiKeyIv: iv,
        resendApiKeyTag: tag,
        isVerified: resendDomains.length > 0,
      })
      .returning();
    configId = config.id;
  }

  // Store discovered domains
  const storedDomains = [];
  for (const d of resendDomains) {
    const [stored] = await db
      .insert(userDomains)
      .values({
        userId: session.user.id,
        resendConfigId: configId,
        domainName: d.name,
        resendDomainId: d.id,
        status: d.status === 'verified' ? 'verified' : d.status === 'failed' ? 'failed' : 'pending',
        canSend: d.status === 'verified',
        canReceive: d.status === 'verified',
      })
      .returning();
    storedDomains.push(stored);
  }

  return NextResponse.json({
    verified: resendDomains.length > 0,
    domains: storedDomains,
  });
}
