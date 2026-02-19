'use client';

import { useState } from 'react';
import {
  Inbox,
  Send,
  FileEdit,
  Star,
  Mail,
  Trash2,
  AlertTriangle,
  PenSquare,
  ChevronDown,
} from 'lucide-react';
import { AccountSwitcher } from './account-switcher';
import { ComposeDialog } from './compose-dialog';
import { useMailFilter, type MailFilter } from './mail-context';

const primaryNav: { label: string; icon: typeof Inbox; filter: MailFilter }[] = [
  { label: 'Inbox', icon: Inbox, filter: 'inbox' },
  { label: 'Starred', icon: Star, filter: 'starred' },
  { label: 'Sent', icon: Send, filter: 'sent' },
  { label: 'Drafts', icon: FileEdit, filter: 'drafts' },
];

const moreNav: { label: string; icon: typeof Inbox; filter: MailFilter }[] = [
  { label: 'All Mail', icon: Mail, filter: 'all' },
  { label: 'Spam', icon: AlertTriangle, filter: 'spam' },
  { label: 'Trash', icon: Trash2, filter: 'trash' },
];

export function Sidebar() {
  const [composeOpen, setComposeOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { filter, setFilter } = useMailFilter();

  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r border-border bg-sidebar">
      {/* Compose button */}
      <div className="p-3">
        <button
          onClick={() => setComposeOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-blue-500 px-4 py-3 text-sm font-medium text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]"
        >
          <PenSquare className="h-4 w-4" />
          Compose
        </button>
      </div>

      {/* Primary navigation */}
      <nav className="flex-1 px-2">
        <div className="space-y-0.5">
          {primaryNav.map((item) => (
            <button
              key={item.label}
              onClick={() => setFilter(item.filter)}
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors ${
                filter === item.filter
                  ? 'border-l-2 border-primary bg-primary/8 font-semibold text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.filter === 'inbox' && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
                  3
                </span>
              )}
            </button>
          ))}
        </div>

        {/* More section */}
        <div className="mt-2">
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            <ChevronDown
              className={`h-3 w-3 transition-transform ${moreOpen ? '' : '-rotate-90'}`}
            />
            More
          </button>
          {moreOpen && (
            <div className="space-y-0.5 mt-0.5">
              {moreNav.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setFilter(item.filter)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors ${
                    filter === item.filter
                      ? 'border-l-2 border-primary bg-primary/8 font-semibold text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Account switcher at bottom */}
      <div className="border-t border-border p-3">
        <AccountSwitcher />
      </div>

      <ComposeDialog open={composeOpen} onOpenChange={setComposeOpen} />
    </aside>
  );
}
