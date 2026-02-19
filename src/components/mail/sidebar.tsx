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
  Settings,
} from 'lucide-react';
import Link from 'next/link';
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
    <aside className="glass-card flex w-[240px] shrink-0 flex-col border-r border-border/40 bg-sidebar/90 backdrop-blur-2xl">
      {/* Compose button */}
      <div className="p-3">
        <button
          onClick={() => setComposeOpen(true)}
          className="btn-compose glow-primary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white tracking-tight transition-all hover:shadow-[0_8px_30px_-4px_rgba(59,130,246,0.4)] active:scale-[0.97]"
        >
          <PenSquare className="h-4 w-4" />
          Compose
        </button>
      </div>

      {/* Primary navigation */}
      <nav className="flex-1 px-2">
        <p className="mb-1 px-3 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50">
          Mail
        </p>
        <div className="space-y-0.5">
          {primaryNav.map((item) => (
            <button
              key={item.label}
              onClick={() => setFilter(item.filter)}
              className={`nav-item group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-all duration-200 ${
                filter === item.filter
                  ? 'nav-active bg-primary/8 font-semibold text-primary'
                  : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
              }`}
            >
              <item.icon className={`h-4 w-4 transition-colors ${filter === item.filter ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-foreground'}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.filter === 'inbox' && (
                <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-bold tabular-nums text-primary">
                  3
                </span>
              )}
            </button>
          ))}
        </div>

        {/* More section */}
        <div className="mt-4">
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/50 transition-colors hover:text-muted-foreground"
          >
            <ChevronDown
              className={`h-3 w-3 transition-transform duration-200 ${moreOpen ? '' : '-rotate-90'}`}
            />
            More
          </button>
          {moreOpen && (
            <div className="space-y-0.5 mt-0.5">
              {moreNav.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setFilter(item.filter)}
                  className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-all duration-200 ${
                    filter === item.filter
                      ? 'nav-active bg-primary/8 font-semibold text-primary'
                      : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                  }`}
                >
                  <item.icon className={`h-4 w-4 transition-colors ${filter === item.filter ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-foreground'}`} />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Settings link */}
      <div className="px-2 pb-1">
        <Link
          href="/settings"
          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-muted-foreground transition-all duration-200 hover:bg-muted/40 hover:text-foreground"
        >
          <Settings className="h-4 w-4 text-muted-foreground/70 group-hover:text-foreground" />
          Settings
        </Link>
      </div>

      {/* Account switcher at bottom */}
      <div className="border-t border-border/30 p-3">
        <AccountSwitcher />
      </div>

      <ComposeDialog open={composeOpen} onOpenChange={setComposeOpen} />
    </aside>
  );
}
