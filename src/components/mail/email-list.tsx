'use client';

import { Star } from 'lucide-react';
import { useThreads } from '@/hooks/use-threads';
import { formatDistanceToNow } from '@/lib/utils';

interface EmailListProps {
  selectedThreadId: string | null;
  onSelectThread: (id: string) => void;
}

export function EmailList({ selectedThreadId, onSelectThread }: EmailListProps) {
  const { threads, loading } = useThreads();

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No emails yet
      </div>
    );
  }

  return (
    <div className="divide-y">
      {threads.map((thread) => (
        <button
          key={thread.id}
          onClick={() => onSelectThread(thread.id)}
          className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
            selectedThreadId === thread.id ? 'bg-primary/5' : ''
          } ${!thread.isRead ? 'bg-blue-50/50' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`truncate text-sm ${!thread.isRead ? 'font-semibold' : 'font-normal text-muted-foreground'}`}
            >
              {thread.subject}
            </span>
            <div className="flex shrink-0 items-center gap-1">
              {thread.isStarred && <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(thread.lastMessageAt)}
              </span>
            </div>
          </div>
          {thread.snippet && (
            <p className="truncate text-xs text-muted-foreground">{thread.snippet}</p>
          )}
          {thread.messageCount > 1 && (
            <span className="text-xs text-muted-foreground">
              {thread.messageCount} messages
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
