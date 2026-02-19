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
  primary: 'bg-blue-500/10 text-blue-400',
  updates: 'bg-emerald-500/10 text-emerald-400',
  promotions: 'bg-amber-500/10 text-amber-400',
  social: 'bg-purple-500/10 text-purple-400',
  forums: 'bg-orange-500/10 text-orange-400',
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
      <div className="p-8 space-y-5 animate-fade-in">
        <div className="h-7 w-2/3 animate-pulse rounded-lg bg-white/[0.04]" />
        <div className="h-4 w-1/3 animate-pulse rounded-md bg-white/[0.03]" />
        <div className="h-px bg-white/[0.04] mt-4" />
        <div className="flex items-center gap-3 mt-4">
          <div className="h-10 w-10 animate-pulse rounded-full bg-white/[0.04]" />
          <div className="space-y-2">
            <div className="h-3.5 w-32 animate-pulse rounded-md bg-white/[0.04]" />
            <div className="h-3 w-48 animate-pulse rounded-md bg-white/[0.03]" />
          </div>
        </div>
        <div className="h-48 animate-pulse rounded-xl bg-white/[0.03] mt-6" />
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground/40 text-[13px]">
        Email not found
      </div>
    );
  }

  const category = email.aiCategory?.toLowerCase();
  const dateStr = email.receivedAt || email.sentAt || email.createdAt;
  const senderName = email.from?.split('<')[0]?.trim() || email.from;
  const senderEmail = email.from?.match(/<(.+?)>/)?.[1] || email.from;

  return (
    <div className="flex h-full flex-col animate-fade-in">
      {/* Subject header + action toolbar */}
      <div className="border-b border-white/[0.05] px-6 py-4 bg-white/[0.01]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[20px] font-semibold text-foreground leading-tight tracking-[-0.02em]">
                {email.subject}
              </h1>
              {category && categoryColors[category] && (
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${categoryColors[category]}`}>
                  {email.aiCategory}
                </span>
              )}
              {email.aiPriority != null && email.aiPriority <= 2 && (
                <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-red-400">
                  Priority {email.aiPriority}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button className="toolbar-btn" title="Archive (e)">
              <Archive className="h-4 w-4" />
            </button>
            <button className="toolbar-btn" title="Delete (#)">
              <Trash2 className="h-4 w-4" />
            </button>
            <button className="toolbar-btn" title="Mark unread">
              <MailOpen className="h-4 w-4" />
            </button>
            <button className="toolbar-btn" title="Star (s)">
              <Star className={`h-4 w-4 ${email.isStarred ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.3)]' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-6">
          {/* AI Summary */}
          {email.aiSummary && (
            <div className="mb-6 rounded-xl border border-primary/[0.08] bg-gradient-to-br from-primary/[0.05] to-primary/[0.02] px-4 py-4 shadow-[0_0_30px_-8px_rgba(59,130,246,0.1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/[0.04] rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-2 mb-2 relative">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/15">
                  <Sparkles className="h-3 w-3 text-primary" />
                </div>
                <span className="text-[11px] font-bold text-primary uppercase tracking-[0.12em]">
                  AI Summary
                </span>
              </div>
              <p className="text-[13px] text-foreground/70 leading-relaxed relative">{email.aiSummary}</p>
            </div>
          )}

          {/* Sender block */}
          <div className="flex items-start gap-3.5 mb-6">
            <MailAvatar email={senderEmail} name={senderName} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-foreground tracking-tight">{senderName}</span>
                <span className="text-[12px] text-muted-foreground/40 font-mono">
                  &lt;{senderEmail}&gt;
                </span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[12px] text-muted-foreground/40">
                  to {email.to?.length === 1 && email.to[0]?.includes('@') ? 'me' : email.to?.join(', ')}
                </span>
                <button
                  onClick={() => setShowHeaders(!showHeaders)}
                  className="flex h-4 w-4 items-center justify-center rounded hover:bg-white/[0.04]"
                >
                  <ChevronDown className={`h-3 w-3 text-muted-foreground/30 transition-transform duration-200 ${showHeaders ? 'rotate-180' : ''}`} />
                </button>
                <span className="ml-auto font-mono text-[12px] text-muted-foreground/30 tabular-nums tracking-tight">
                  {formatDistanceToNow(dateStr)} · {new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              {showHeaders && (
                <div className="mt-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-3.5 text-[12px] text-muted-foreground/50 space-y-1.5 animate-fade-in">
                  <div><span className="font-medium text-muted-foreground/70">From:</span> {email.from}</div>
                  <div><span className="font-medium text-muted-foreground/70">To:</span> {email.to?.join(', ')}</div>
                  {email.cc && email.cc.length > 0 && (
                    <div><span className="font-medium text-muted-foreground/70">Cc:</span> {email.cc.join(', ')}</div>
                  )}
                  <div><span className="font-medium text-muted-foreground/70">Date:</span> {new Date(dateStr).toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="border-t border-white/[0.04] pt-6">
            {email.bodyHtml ? (
              <div
                className="prose prose-sm max-w-none text-foreground/85 prose-a:text-primary prose-blockquote:border-border prose-blockquote:text-muted-foreground leading-relaxed"
                dangerouslySetInnerHTML={{ __html: email.bodyHtml }}
              />
            ) : email.bodyText ? (
              <pre className="whitespace-pre-wrap text-[14px] leading-relaxed text-foreground/85 font-sans">
                {email.bodyText}
              </pre>
            ) : (
              <p className="text-[13px] text-muted-foreground/35 italic">No content</p>
            )}
          </div>
        </div>
      </div>

      {/* Reply bar */}
      <div className="border-t border-white/[0.05] px-6 py-4 bg-white/[0.015]">
        <ReplySuggestions email={email} />
        <div className="flex items-center gap-2.5 mt-3">
          <Button
            onClick={() => setReplyOpen(true)}
            size="sm"
            className="rounded-xl shadow-[0_2px_12px_-2px_rgba(59,130,246,0.25)] hover:shadow-[0_4px_20px_-4px_rgba(59,130,246,0.35)]"
          >
            <Reply className="mr-1.5 h-3.5 w-3.5" />
            Reply
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl">
            <ReplyAll className="mr-1.5 h-3.5 w-3.5" />
            Reply All
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl">
            <Forward className="mr-1.5 h-3.5 w-3.5" />
            Forward
          </Button>
        </div>
      </div>

      <ComposeDialog open={replyOpen} onOpenChange={setReplyOpen} />
    </div>
  );
}
