import { db } from '@/lib/db';
import { emailAccounts, emails, threads, userResendConfigs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getResendClient } from './client';
import { decryptApiKey } from '@/lib/crypto';

interface SendEmailParams {
  accountId: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  inReplyTo?: string;
  references?: string[];
  threadId?: string;
}

async function getUserResendApiKey(userId: string): Promise<string> {
  const [config] = await db
    .select()
    .from(userResendConfigs)
    .where(eq(userResendConfigs.userId, userId))
    .limit(1);

  if (!config) throw new Error('No Resend configuration found. Complete onboarding first.');

  return decryptApiKey(config.resendApiKeyEncrypted, config.resendApiKeyIv, config.resendApiKeyTag);
}

export async function sendEmail(params: SendEmailParams) {
  const [account] = await db
    .select()
    .from(emailAccounts)
    .where(eq(emailAccounts.id, params.accountId))
    .limit(1);

  if (!account) throw new Error('Email account not found');

  // Look up the user's BYOK Resend API key
  const apiKey = await getUserResendApiKey(account.userId);
  const resend = getResendClient(apiKey);

  const headers: Record<string, string> = {};
  if (params.inReplyTo) headers['In-Reply-To'] = params.inReplyTo;
  if (params.references?.length) headers['References'] = params.references.join(' ');

  const sendOptions: Record<string, unknown> = {
    from: `${account.name} <${account.email}>`,
    to: params.to,
    subject: params.subject,
    headers,
  };
  if (params.cc?.length) sendOptions.cc = params.cc;
  if (params.bcc?.length) sendOptions.bcc = params.bcc;
  if (params.html) sendOptions.html = params.html;
  if (params.text) sendOptions.text = params.text;
  if (params.replyTo) sendOptions.replyTo = params.replyTo;
  if (!sendOptions.html && !sendOptions.text) sendOptions.text = '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await resend.emails.send(sendOptions as any);

  if (result.error) {
    throw new Error(result.error.message);
  }

  const snippet = (params.text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);

  // Find or create thread
  let threadId = params.threadId;
  if (!threadId) {
    const [newThread] = await db
      .insert(threads)
      .values({
        accountId: params.accountId,
        subject: params.subject,
        lastMessageAt: new Date(),
        messageCount: 1,
        snippet,
      })
      .returning();
    threadId = newThread.id;
  } else {
    await db
      .update(threads)
      .set({
        lastMessageAt: new Date(),
        messageCount: (() => {
          return 1; // placeholder, real impl would increment
        })(),
        snippet,
      })
      .where(eq(threads.id, threadId));
  }

  const [email] = await db
    .insert(emails)
    .values({
      accountId: params.accountId,
      threadId,
      messageId: result.data?.id ?? null,
      direction: 'outbound',
      from: `${account.name} <${account.email}>`,
      to: params.to,
      cc: params.cc ?? [],
      bcc: params.bcc ?? [],
      subject: params.subject,
      bodyHtml: params.html ?? null,
      bodyText: params.text ?? null,
      snippet,
      isRead: true,
      status: 'sent',
      headers,
      sentAt: new Date(),
    })
    .returning();

  return email;
}
