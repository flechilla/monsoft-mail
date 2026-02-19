import { generateObject } from 'ai';
import { z } from 'zod';
import { defaultModel } from './provider';

const classificationSchema = z.object({
  category: z.string().describe('Email category like primary, social, promotions, updates, forums, spam'),
  priority: z.number().min(1).max(5).describe('Priority 1 (lowest) to 5 (highest/urgent)'),
  summary: z.string().describe('One-sentence summary of the email'),
  suggestedLabels: z.array(z.string()).describe('Suggested label names for this email'),
});

export type EmailClassification = z.infer<typeof classificationSchema>;

export async function classifyEmail(email: {
  from: string;
  subject: string;
  bodyText: string | null;
}): Promise<EmailClassification> {
  const { object } = await generateObject({
    model: defaultModel,
    schema: classificationSchema,
    prompt: `Classify this email:
From: ${email.from}
Subject: ${email.subject}
Body: ${(email.bodyText || '').slice(0, 2000)}

Return the category, priority (1-5), a brief summary, and suggested labels.`,
  });

  return object;
}
