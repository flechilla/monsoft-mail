import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { generateReplySuggestions } from '@/lib/ai/reply';

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { email, threadContext } = await req.json();

  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

  const suggestions = await generateReplySuggestions(
    { from: email.from, subject: email.subject, bodyText: email.bodyText },
    threadContext,
  );

  return NextResponse.json(suggestions);
}
