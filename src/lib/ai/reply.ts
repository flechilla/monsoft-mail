import { generateObject } from 'ai';
import { z } from 'zod';
import { defaultModel } from './provider';

const replySuggestionsSchema = z.object({
  suggestions: z.array(
    z.object({
      tone: z.string().describe('Tone of the reply: positive, neutral, decline, etc.'),
      subject: z.string(),
      body: z.string(),
    }),
  ).length(3),
});

export type ReplySuggestions = z.infer<typeof replySuggestionsSchema>;

export async function generateReplySuggestions(
  email: { from: string; subject: string; bodyText: string | null },
  threadContext?: string,
): Promise<ReplySuggestions> {
  const { object } = await generateObject({
    model: defaultModel,
    schema: replySuggestionsSchema,
    prompt: `Generate 3 different reply suggestions for this email:
From: ${email.from}
Subject: ${email.subject}
Body: ${(email.bodyText || '').slice(0, 2000)}
${threadContext ? `\nThread context:\n${threadContext}` : ''}

Provide 3 replies with different tones (e.g., positive/accepting, neutral/informational, declining/postponing).`,
  });

  return object;
}
