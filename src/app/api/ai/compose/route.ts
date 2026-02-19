import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { composeEmail } from '@/lib/ai/compose';

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response('Unauthorized', { status: 401 });

  const { prompt, threadContext } = await req.json();

  if (!prompt) return new Response('Missing prompt', { status: 400 });

  const result = composeEmail(prompt, threadContext);

  return result.toDataStreamResponse();
}
