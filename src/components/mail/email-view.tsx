'use client';

import { useState, useEffect } from 'react';
import {
  Star,
  Reply,
  ReplyAll,
  Forward,
  Archive,
  Trash2,
  MailOpen,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MailAvatar } from './avatar';
import { ReplySuggestions } from './reply-suggestions';
import { ComposeDialog } from './compose-dialog';
import { formatDistanceToNow } from '@/lib/utils';

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
  primary: 'bg-blue-500/8 text-blue-400',
  updates: 'bg-emerald-500/8 text-emerald-400',
  promotions: 'bg-amber-500/8 text-amber-400',
  social: 'bg-purple-500/8 text-purple-400',
  forums: 'bg-orange-500/8 text-orange-400',
};

export function EmailView({ emailId }: { emailId: string }) {
  const [email, setEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyOpen, setReplyOpen] = useState(false);
  const [showHeaders, setShowHeaders] = useState(false);

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
      <div className="p-8 space-y-4">
        <div className="h-7 w-2/3 animate-pulse rounded-lg bg-muted/50" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-muted/50" />
        <div className="h-48 animate-pulse rounded-lg bg-muted/50 mt-6" />
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground/60">
        Email not found
      </div>
    );
  }

  const category = email.aiCategory?.toLowerCase();
  const dateStr = email.receivedAt || email.sentAt || email.createdAt;
  const senderName = email.from?.split('<')[0]?.trim() || email.from;
  const senderEmail = email.from?.match(/<(.+?)>/)?.[1] || email.from;

  return (
    <div className="flex h-full flex-col">
      {/* Subject header + action toolbar */}
      <div className="border-b border-border/30 px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-semibold text-foreground leading-tight tracking-tight">
                {email.subject}
              </h1>
              {category && categoryColors[category] && (
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${categoryColors[category]}`}>
                  {email.aiCategory}
                </span>
              )}
              {email.aiPriority != null && email.aiPriority <= 2 && (
                <span className="rounded-full bg-red-500/8 px-2.5 py-0.5 text-[11px] font-medium text-red-400">
                  Priority {email.aiPriority}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/60 transition-all duration-200 hover:bg-muted/40 hover:text-foreground hover:scale-105 active:scale-95" title="Archive (e)">
              <Archive className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/60 transition-all duration-200 hover:bg-muted/40 hover:text-foreground hover:scale-105 active:scale-95" title="Delete (#)">
              <Trash2 className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/60 transition-all duration-200 hover:bg-muted/40 hover:text-foreground hover:scale-105 active:scale-95" title="Mark unread">
              <MailOpen className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/60 transition-all duration-200 hover:bg-muted/40 hover:text-foreground hover:scale-105 active:scale-95" title="Star (s)">
              <Star className={`h-4 w-4 ${email.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-6">
          {/* AI Summary */}
          {email.aiSummary && (
            <div className="glass-card mb-6 rounded-xl border border-primary/10 bg-primary/[0.03] px-4 py-3.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-[11px] font-semibold text-primary uppercase tracking-[0.1em]">
                  AI Summary
                </span>
              </div>
              <p className="text-[13px] text-foreground/75 leading-relaxed">{email.aiSummary}</p>
            </div>
          )}

          {/* Sender block */}
          <div className="flex items-start gap-3.5 mb-6">
            <MailAvatar email={senderEmail} name={senderName} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground tracking-tight">{senderName}</span>
                <span className="text-[12px] text-muted-foreground/60 font-mono">
                  &lt;{senderEmail}&gt;
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[12px] text-muted-foreground/60">
                  to {email.to?.length === 1 && email.to[0]?.includes('@') ? 'me' : email.to?.join(', ')}
                </span>
                <button
                  onClick={() => setShowHeaders(!showHeaders)}
                  className="flex h-4 w-4 items-center justify-center rounded hover:bg-muted/40"
                >
                  <ChevronDown className={`h-3 w-3 text-muted-foreground/50 transition-transform duration-200 ${showHeaders ? 'rotate-180' : ''}`} />
                </button>
                <span className="ml-auto font-mono text-[12px] text-muted-foreground/40 tabular-nums tracking-tight">
                  {formatDistanceToNow(dateStr)} · {new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              {showHeaders && (
                <div className="mt-2.5 rounded-lg border border-border/30 bg-muted/20 p-3 text-[12px] text-muted-foreground/70 space-y-1">
                  <div><span className="font-medium text-muted-foreground">From:</span> {email.from}</div>
                  <div><span className="font-medium text-muted-foreground">To:</span> {email.to?.join(', ')}</div>
                  {email.cc && email.cc.length > 0 && (
                    <div><span className="font-medium text-muted-foreground">Cc:</span> {email.cc.join(', ')}</div>
                  )}
                  <div><span className="font-medium text-muted-foreground">Date:</span> {new Date(dateStr).toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="border-t border-border/30 pt-6">
            {email.bodyHtml ? (
              <div
                className="prose prose-sm max-w-none text-foreground/90 prose-a:text-primary prose-blockquote:border-border prose-blockquote:text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
              />
            ) : email.bodyText ? (
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-sans">
                {email.bodyText}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground/50 italic">No content</p>
            )}
          </div>
        </div>
      </div>

      {/* Reply bar */}
      <div className="border-t border-border/30 px-6 py-4">
        <ReplySuggestions email={email} />
        <div className="flex items-center gap-2 mt-3">
          <Button
            onClick={() => setReplyOpen(true)}
            size="sm"
            className="rounded-lg"
          >
            <Reply className="mr-1.5 h-3.5 w-3.5" />
            Reply
          </Button>
          <Button variant="outline" size="sm" className="rounded-lg">
            <ReplyAll className="mr-1.5 h-3.5 w-3.5" />
            Reply All
          </Button>
          <Button variant="outline" size="sm" className="rounded-lg">
            <Forward className="mr-1.5 h-3.5 w-3.5" />
            Forward
          </Button>
        </div>
      </div>

      <ComposeDialog open={replyOpen} onOpenChange={setReplyOpen} />
    </div>
  );
}
