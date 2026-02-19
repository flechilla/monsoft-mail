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
  primary: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  updates: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  promotions: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  social: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  forums: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
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
          <div key={i} className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-white/[0.04]" />
            <div className="flex-1 space-y-2.5">
              <div className="h-3.5 w-28 animate-pulse rounded-md bg-white/[0.04]" />
              <div className="h-3 w-44 animate-pulse rounded-md bg-white/[0.03]" />
              <div className="h-2.5 w-56 animate-pulse rounded-md bg-white/[0.02]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground px-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.04]">
          <Mail className="h-6 w-6 text-muted-foreground/25" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <p className="text-[13px] font-medium text-muted-foreground/50">No emails yet</p>
          <p className="text-[12px] text-muted-foreground/30 mt-1">Your inbox is empty</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0.5 p-2">
      {emails.map((email, idx) => {
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
            className={`email-row email-row-premium group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 animate-fade-in ${
              isSelected
                ? 'nav-active bg-primary/[0.07] shadow-[inset_0_1px_0_rgba(59,130,246,0.05),0_0_0_1px_rgba(59,130,246,0.08)] border border-primary/[0.06]'
                : 'hover:bg-white/[0.03] hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.2)] border border-transparent'
            }`}
            style={{ animationDelay: `${idx * 30}ms` }}
          >
            {/* Unread indicator */}
            <div className="w-1.5 self-stretch shrink-0 flex items-center">
              {isUnread && (
                <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              )}
            </div>

            {/* Avatar */}
            <MailAvatar email={displayEmail} name={displayName} size="md" />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`truncate text-[13px] leading-tight ${
                    isUnread ? 'font-semibold text-foreground' : 'font-normal text-muted-foreground/80'
                  }`}
                >
                  {displayName}
                </span>
                <div className="flex shrink-0 items-center gap-1.5 ml-auto">
                  {/* Hover actions */}
                  <div className="hover-actions items-center gap-0.5">
                    <button
                      className="toolbar-btn !h-6 !w-6"
                      title="Archive (e)"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Archive className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className="toolbar-btn !h-6 !w-6"
                      title="Delete (#)"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className="toolbar-btn !h-6 !w-6"
                      title={isUnread ? 'Mark read' : 'Mark unread'}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isUnread ? (
                        <MailOpen className="h-3.5 w-3.5" />
                      ) : (
                        <Mail className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Star */}
                  {email.isStarred && (
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0 drop-shadow-[0_0_4px_rgba(251,191,36,0.3)]" />
                  )}

                  {/* Time */}
                  <span className="hide-on-hover font-mono text-[11px] text-muted-foreground/35 whitespace-nowrap tabular-nums tracking-tight">
                    {formatDistanceToNow(dateStr)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`truncate text-[13px] leading-tight ${isUnread ? 'font-medium text-foreground/90' : 'text-muted-foreground/60'}`}>
                  {email.subject}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                {email.snippet && (
                  <p className="truncate text-[12px] leading-relaxed text-muted-foreground/30 flex-1">
                    {email.snippet}
                  </p>
                )}
                <div className="flex shrink-0 items-center gap-1.5">
                  {category && categoryColors[category] && (
                    <span
                      className={`badge-category border ${categoryColors[category]}`}
                    >
                      {email.aiCategory}
                    </span>
                  )}
                  {email.aiPriority != null && email.aiPriority <= 2 && (
                    <span className="badge-category border border-red-500/20 bg-red-500/10 text-red-400">
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
