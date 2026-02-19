'use client';

import { Star } from 'lucide-react';
import { useEmails } from '@/hooks/use-emails';
import { useMailFilter, type MailFilter } from './mail-context';
import { formatDistanceToNow } from '@/lib/utils';
import { useMemo } from 'react';

interface EmailListProps {
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  primary: 'bg-blue-100 text-blue-700',
  updates: 'bg-green-100 text-green-700',
  promotions: 'bg-yellow-100 text-yellow-700',
  social: 'bg-purple-100 text-purple-700',
  forums: 'bg-orange-100 text-orange-700',
};

function getFilterParams(filter: MailFilter) {
  switch (filter) {
    case 'inbox':
      return { direction: 'inbound' as const };
    case 'sent':
      return { direction: 'outbound' as const };
    case 'drafts':
      return { status: 'draft' };
    case 'starred':
      return { isStarred: true };
    case 'all':
    default:
      return {};
  }
}

export function EmailList({ selectedEmailId, onSelectEmail }: EmailListProps) {
  const { filter } = useMailFilter();
  const params = useMemo(() => getFilterParams(filter), [filter]);
  const { emails, loading } = useEmails(params);

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No emails
      </div>
    );
  }

  return (
    <div className="divide-y">
      {emails.map((email) => {
        const isOutbound = email.direction === 'outbound';
        const displayName = isOutbound
          ? `To: ${email.to?.[0] || 'Unknown'}`
          : email.from;
        const dateStr = email.receivedAt || email.sentAt || email.createdAt;
        const category = email.aiCategory?.toLowerCase();

        return (
          <button
            key={email.id}
            onClick={() => onSelectEmail(email.id)}
            className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
              selectedEmailId === email.id ? 'bg-primary/5' : ''
            } ${!email.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {!email.isRead && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                )}
                <span
                  className={`truncate text-sm ${!email.isRead ? 'font-semibold' : 'font-normal text-muted-foreground'}`}
                >
                  {displayName}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {email.isStarred && (
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(dateStr)}
                </span>
              </div>
            </div>

            <span className={`truncate text-sm ${!email.isRead ? 'font-medium' : ''}`}>
              {email.subject}
            </span>

            <div className="flex items-center gap-2">
              {email.snippet && (
                <p className="truncate text-xs text-muted-foreground flex-1">
                  {email.snippet}
                </p>
              )}
              <div className="flex shrink-0 items-center gap-1">
                {category && categoryColors[category] && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${categoryColors[category]}`}
                  >
                    {email.aiCategory}
                  </span>
                )}
                {email.aiPriority != null && email.aiPriority <= 2 && (
                  <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
                    P{email.aiPriority}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
