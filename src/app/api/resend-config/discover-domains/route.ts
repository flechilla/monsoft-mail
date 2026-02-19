import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userResendConfigs, userDomains } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { decryptApiKey } from '@/lib/crypto';
import { Resend } from 'resend';

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [config] = await db
    .select()
    .from(userResendConfigs)
    .where(eq(userResendConfigs.userId, session.user.id))
    .limit(1);

  if (!config) {
    return NextResponse.json({ error: 'No Resend configuration found' }, { status: 404 });
  }

  const apiKey = decryptApiKey(config.resendApiKeyEncrypted, config.resendApiKeyIv, config.resendApiKeyTag);
  const resend = new Resend(apiKey);

  let resendDomains;
  try {
    const result = await resend.domains.list();
    if (result.error) throw new Error(result.error.message);
    resendDomains = result.data?.data ?? [];
  } catch (e) {
    return NextResponse.json(
      { error: 'Resend API error', details: (e as Error).message },
      { status: 400 },
    );
  }

  // Clear existing domains and re-sync
  await db.delete(userDomains).where(eq(userDomains.resendConfigId, config.id));

  const storedDomains = [];
  for (const d of resendDomains) {
    const [stored] = await db
      .insert(userDomains)
      .values({
        userId: session.user.id,
        resendConfigId: config.id,
        domainName: d.name,
        resendDomainId: d.id,
        status: d.status === 'verified' ? 'verified' : d.status === 'failed' ? 'failed' : 'pending',
        canSend: d.status === 'verified',
        canReceive: d.status === 'verified',
      })
      .returning();
    storedDomains.push(stored);
  }

  // Update verification status
  await db
    .update(userResendConfigs)
    .set({
      isVerified: resendDomains.some((d) => d.status === 'verified'),
      updatedAt: new Date(),
    })
    .where(eq(userResendConfigs.id, config.id));

  return NextResponse.json({ domains: storedDomains });
}
