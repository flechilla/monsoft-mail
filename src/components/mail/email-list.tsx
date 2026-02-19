'use client';

import { Star, Archive, Trash2, MailOpen, Mail } from 'lucide-react';
import { useEmails } from '@/hooks/use-emails';
import { useMailFilter, type MailFilter } from './mail-context';
import { MailAvatar } from './avatar';
import { formatDistanceToNow } from '@/lib/utils';
import { useMemo } from 'react';

interface EmailListProps {
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
}

const categoryColors: Record<string, string> = {
  primary: 'bg-blue-50 text-blue-600 border-blue-200',
  updates: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  promotions: 'bg-amber-50 text-amber-600 border-amber-200',
  social: 'bg-purple-50 text-purple-600 border-purple-200',
  forums: 'bg-orange-50 text-orange-600 border-orange-200',
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
      <div className="space-y-1 p-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg p-3">
            <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-32 animate-pulse rounded bg-muted" />
              <div className="h-3 w-48 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
        <Mail className="h-10 w-10 opacity-20" />
        <span className="text-sm">No emails</span>
      </div>
    );
  }

  return (
    <div className="space-y-0.5 p-1.5">
      {emails.map((email) => {
        const isOutbound = email.direction === 'outbound';
        const displayName = isOutbound
          ? `To: ${email.to?.[0]?.split('@')[0] || 'Unknown'}`
          : email.from?.split('<')[0]?.trim() || email.from;
        const displayEmail = isOutbound ? email.to?.[0] || '' : email.from || '';
        const dateStr = email.receivedAt || email.sentAt || email.createdAt;
        const category = email.aiCategory?.toLowerCase();
        const isSelected = selectedEmailId === email.id;
        const isUnread = !email.isRead;

        return (
          <button
            key={email.id}
            onClick={() => onSelectEmail(email.id)}
            className={`email-row group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
              isSelected
                ? 'bg-primary/8 shadow-sm'
                : isUnread
                  ? 'bg-blue-50/40 hover:bg-muted'
                  : 'hover:bg-muted/60'
            }`}
          >
            {/* Unread indicator */}
            <div className="w-0.5 self-stretch rounded-full shrink-0">
              {isUnread && <div className="h-full w-full rounded-full bg-primary" />}
            </div>

            {/* Avatar */}
            <MailAvatar email={displayEmail} name={displayName} size="md" />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`truncate text-[13px] ${
                    isUnread ? 'font-semibold text-foreground' : 'font-normal text-muted-foreground'
                  }`}
                >
                  {displayName}
                </span>
                <div className="flex shrink-0 items-center gap-1.5 ml-auto">
                  {/* Hover actions */}
                  <div className="hover-actions items-center gap-0.5">
                    <button
                      className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-background hover:shadow-sm"
                      title="Archive (e)"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Archive className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button
                      className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-background hover:shadow-sm"
                      title="Delete (#)"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button
                      className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-background hover:shadow-sm"
                      title={isUnread ? 'Mark read' : 'Mark unread'}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isUnread ? (
                        <MailOpen className="h-3.5 w-3.5 text-muted-foreground" />
                      ) : (
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </button>
                  </div>

                  {/* Star */}
                  {email.isStarred && (
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                  )}

                  {/* Time */}
                  <span className="hide-on-hover text-[11px] text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(dateStr)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`truncate text-[13px] ${isUnread ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                  {email.subject}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {email.snippet && (
                  <p className="truncate text-[12px] text-muted-foreground/70 flex-1">
                    {email.snippet}
                  </p>
                )}
                <div className="flex shrink-0 items-center gap-1">
                  {category && categoryColors[category] && (
                    <span
                      className={`rounded-full border px-2 py-0 text-[10px] font-medium ${categoryColors[category]}`}
                    >
                      {email.aiCategory}
                    </span>
                  )}
                  {email.aiPriority != null && email.aiPriority <= 2 && (
                    <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0 text-[10px] font-medium text-red-600">
                      P{email.aiPriority}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
