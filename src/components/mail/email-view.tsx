'use client';

import { useState, useEffect } from 'react';
import { Star, Reply, Forward, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReplySuggestions } from './reply-suggestions';
import { ComposeDialog } from './compose-dialog';

interface Email {
  id: string;
  from: string;
  to: string[];
  cc: string[] | null;
  bcc: string[] | null;
  subject: string;
  bodyHtml: string | null;
  bodyText: string | null;
  isStarred: boolean;
  isRead: boolean;
  direction: string;
  status: string;
  aiSummary: string | null;
  aiCategory: string | null;
  aiPriority: number | null;
  sentAt: string | null;
  receivedAt: string | null;
  createdAt: string;
}

const categoryColors: Record<string, string> = {
  primary: 'bg-blue-100 text-blue-700',
  updates: 'bg-green-100 text-green-700',
  promotions: 'bg-yellow-100 text-yellow-700',
  social: 'bg-purple-100 text-purple-700',
  forums: 'bg-orange-100 text-orange-700',
};

export function EmailView({ emailId }: { emailId: string }) {
  const [email, setEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyOpen, setReplyOpen] = useState(false);

  useEffect(() => {
    async function fetchEmail() {
      setLoading(true);
      try {
        const res = await fetch(`/api/emails/${emailId}`);
        if (res.ok) {
          const data = await res.json();
          setEmail(data.email);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchEmail();
  }, [emailId]);

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-8 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Email not found
      </div>
    );
  }

  const category = email.aiCategory?.toLowerCase();
  const dateStr = email.receivedAt || email.sentAt || email.createdAt;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{email.subject}</h2>
            {category && categoryColors[category] && (
              <span className={`rounded px-2 py-0.5 text-xs font-medium ${categoryColors[category]}`}>
                {email.aiCategory}
              </span>
            )}
            {email.aiPriority != null && email.aiPriority <= 2 && (
              <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                P{email.aiPriority}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon">
              <Star className={`h-4 w-4 ${email.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {email.aiSummary && (
          <p className="mt-2 rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            ✨ {email.aiSummary}
          </p>
        )}
      </div>

      {/* Email metadata + body */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl p-6">
          {/* From / To / CC / Date */}
          <div className="mb-4 space-y-1 text-sm">
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-muted-foreground w-12">From</span>
              <span className="font-medium">{email.from}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-muted-foreground w-12">To</span>
              <span>{email.to?.join(', ')}</span>
            </div>
            {email.cc && email.cc.length > 0 && (
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-muted-foreground w-12">Cc</span>
                <span>{email.cc.join(', ')}</span>
              </div>
            )}
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-muted-foreground w-12">Date</span>
              <span>{new Date(dateStr).toLocaleString()}</span>
            </div>
          </div>

          <hr className="mb-4" />

          {/* Body */}
          {email.bodyHtml ? (
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
            />
          ) : email.bodyText ? (
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">{email.bodyText}</pre>
          ) : (
            <p className="text-sm text-muted-foreground italic">No content</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="border-t p-4">
        <ReplySuggestions email={email} />
        <div className="mt-3 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setReplyOpen(true)}>
            <Reply className="mr-1 h-4 w-4" />
            Reply
          </Button>
          <Button variant="outline" size="sm">
            <Forward className="mr-1 h-4 w-4" />
            Forward
          </Button>
        </div>
      </div>

      <ComposeDialog open={replyOpen} onOpenChange={setReplyOpen} />
    </div>
  );
}
