import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { db } from '@/lib/db';
import { emailAccounts, emails, threads } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { classifyEmail } from '@/lib/ai/classify';

function verifyWebhook(body: string, headers: Headers): Record<string, unknown> | null {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return JSON.parse(body); // skip verification if no secret
  try {
    const wh = new Webhook(secret);
    return wh.verify(body, {
      'svix-id': headers.get('svix-id') ?? '',
      'svix-timestamp': headers.get('svix-timestamp') ?? '',
      'svix-signature': headers.get('svix-signature') ?? '',
    }) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function normalizeSubject(subject: string): string {
  return subject.replace(/^(Re|Fwd|Fw):\s*/gi, '').trim();
}

async function findOrCreateThread(
  accountId: string,
  subject: string,
  headers: Record<string, string>,
  snippet: string,
) {
  // Try matching by In-Reply-To / References headers
  const inReplyTo = headers['In-Reply-To'] || headers['in-reply-to'];
  const references = headers['References'] || headers['references'];

  if (inReplyTo) {
    const [existingEmail] = await db
      .select({ threadId: emails.threadId })
      .from(emails)
      .where(and(eq(emails.accountId, accountId), eq(emails.messageId, inReplyTo.replace(/[<>]/g, ''))))
      .limit(1);

    if (existingEmail?.threadId) {
      return existingEmail.threadId;
    }
  }

  if (references) {
    const refIds = references.split(/\s+/).map((r: string) => r.replace(/[<>]/g, ''));
    for (const refId of refIds) {
      const [existingEmail] = await db
        .select({ threadId: emails.threadId })
        .from(emails)
        .where(and(eq(emails.accountId, accountId), eq(emails.messageId, refId)))
        .limit(1);

      if (existingEmail?.threadId) {
        return existingEmail.threadId;
      }
    }
  }

  // Fallback: match by normalized subject
  const normalized = normalizeSubject(subject);
  const [existingThread] = await db
    .select({ id: threads.id })
    .from(threads)
    .where(and(eq(threads.accountId, accountId), eq(threads.subject, normalized)))
    .limit(1);

  if (existingThread) return existingThread.id;

  // Create new thread
  const [newThread] = await db
    .insert(threads)
    .values({
      accountId,
      subject: normalized,
      lastMessageAt: new Date(),
      messageCount: 1,
      snippet,
    })
    .returning();

  return newThread.id;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const payload = verifyWebhook(body, req.headers);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { type, data } = payload as { type: string; data: any };

  // Handle email.received event
  if (type !== 'email.received') {
    return NextResponse.json({ ok: true });
  }

  const {
    from: fromAddr,
    to: toAddrs,
    subject,
    html,
    text: textBody,
    headers: emailHeaders,
    message_id,
    cc,
  } = data;

  // Find matching account by recipient email
  const toList: string[] = Array.isArray(toAddrs) ? toAddrs : [toAddrs];
  const [account] = await db
    .select()
    .from(emailAccounts)
    .where(eq(emailAccounts.email, toList[0]))
    .limit(1);

  if (!account) {
    return NextResponse.json({ error: 'No matching account' }, { status: 404 });
  }

  const snippet = (textBody || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);

  const parsedHeaders: Record<string, string> = {};
  if (emailHeaders && typeof emailHeaders === 'object') {
    Object.assign(parsedHeaders, emailHeaders);
  }

  const threadId = await findOrCreateThread(account.id, subject || '(no subject)', parsedHeaders, snippet);

  // Update thread
  await db
    .update(threads)
    .set({
      lastMessageAt: new Date(),
      snippet,
      isRead: false,
    })
    .where(eq(threads.id, threadId));

  // Store email
  const [storedEmail] = await db
    .insert(emails)
    .values({
      accountId: account.id,
      threadId,
      messageId: message_id || null,
      direction: 'inbound',
      from: fromAddr,
      to: toList,
      cc: cc ? (Array.isArray(cc) ? cc : [cc]) : [],
      subject: subject || '(no subject)',
      bodyHtml: html || null,
      bodyText: textBody || null,
      snippet,
      isRead: false,
      status: 'delivered',
      headers: parsedHeaders,
      receivedAt: new Date(),
    })
    .returning();

  // Trigger AI classification async (don't block response)
  classifyEmail({ from: fromAddr, subject: subject || '', bodyText: textBody })
    .then(async (classification) => {
      await db
        .update(emails)
        .set({
          aiSummary: classification.summary,
          aiCategory: classification.category,
          aiPriority: classification.priority,
        })
        .where(eq(emails.id, storedEmail.id));

      await db
        .update(threads)
        .set({ aiSummary: classification.summary })
        .where(eq(threads.id, threadId));
    })
    .catch(console.error);

  return NextResponse.json({ ok: true, emailId: storedEmail.id });
}
