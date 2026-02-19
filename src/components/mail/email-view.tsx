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
  subject: string;
  bodyHtml: string | null;
  bodyText: string | null;
  isStarred: boolean;
  direction: string;
  createdAt: string;
}

interface Thread {
  id: string;
  subject: string;
  aiSummary: string | null;
}

export function EmailView({ threadId }: { threadId: string }) {
  const [thread, setThread] = useState<Thread | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyOpen, setReplyOpen] = useState(false);

  useEffect(() => {
    async function fetchThread() {
      setLoading(true);
      try {
        const res = await fetch(`/api/threads/${threadId}`);
        if (res.ok) {
          const data = await res.json();
          setThread(data.thread);
          setEmails(data.emails);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchThread();
  }, [threadId]);

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-8 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Thread not found
      </div>
    );
  }

  const lastEmail = emails[emails.length - 1];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{thread.subject}</h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon">
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {thread.aiSummary && (
          <p className="mt-1 text-sm text-muted-foreground">
            ✨ {thread.aiSummary}
          </p>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {emails.map((email) => (
          <div key={email.id} className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <span className="font-medium">{email.from}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  to {email.to.join(', ')}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(email.createdAt).toLocaleString()}
              </span>
            </div>
            {email.bodyHtml ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
              />
            ) : (
              <pre className="whitespace-pre-wrap text-sm">{email.bodyText}</pre>
            )}
          </div>
        ))}
      </div>

      {lastEmail && (
        <div className="border-t p-4">
          <ReplySuggestions email={lastEmail} />
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
      )}

      <ComposeDialog open={replyOpen} onOpenChange={setReplyOpen} />
    </div>
  );
}
