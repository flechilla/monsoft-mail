import { Resend } from 'resend';

const clientCache = new Map<string, Resend>();

export function getResendClient(apiKey: string): Resend {
  const cached = clientCache.get(apiKey);
  if (cached) return cached;
  const client = new Resend(apiKey);
  clientCache.set(apiKey, client);
  return client;
}
