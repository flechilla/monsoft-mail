import { streamText } from 'ai';
import { defaultModel } from './provider';

export function composeEmail(prompt: string, threadContext?: string) {
  return streamText({
    model: defaultModel,
    system: `You are an email writing assistant. Write professional, clear, and concise emails.
${threadContext ? `\nPrevious conversation context:\n${threadContext}` : ''}`,
    prompt,
  });
}
