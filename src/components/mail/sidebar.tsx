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
    <aside className="sidebar-ambient flex w-[240px] shrink-0 flex-col bg-[#08080b]/95 backdrop-blur-2xl border-r border-white/[0.04]">
      {/* Compose button */}
      <div className="p-3 pt-4">
        <button
          onClick={() => setComposeOpen(true)}
          className="btn-compose animate-pulse-glow flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-[13px] font-semibold text-white tracking-tight transition-all duration-300 hover:shadow-[0_8px_40px_-4px_rgba(59,130,246,0.5)] active:scale-[0.97]"
        >
          <PenSquare className="h-4 w-4" />
          Compose
        </button>
      </div>

      {/* Primary navigation */}
      <nav className="flex-1 px-2 mt-1">
        <p className="mb-1.5 px-3 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/40">
          Mail
        </p>
        <div className="space-y-0.5">
          {primaryNav.map((item) => (
            <button
              key={item.label}
              onClick={() => setFilter(item.filter)}
              className={`nav-item group flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] transition-all duration-200 ${
                filter === item.filter
                  ? 'nav-active bg-primary/[0.08] font-semibold text-primary shadow-[inset_0_1px_0_rgba(59,130,246,0.06)]'
                  : 'text-muted-foreground hover:bg-white/[0.03] hover:text-foreground'
              }`}
            >
              <item.icon className={`h-[18px] w-[18px] transition-all duration-200 ${filter === item.filter ? 'text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]' : 'text-muted-foreground/50 group-hover:text-foreground/70'}`} strokeWidth={filter === item.filter ? 2.2 : 1.8} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.filter === 'inbox' && (
                <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold tabular-nums text-primary shadow-[0_0_8px_rgba(59,130,246,0.15)]">
                  3
                </span>
              )}
            </button>
          ))}
        </div>

        {/* More section */}
        <div className="mt-5">
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/35 transition-colors hover:text-muted-foreground/60"
          >
            <ChevronDown
              className={`h-3 w-3 transition-transform duration-200 ${moreOpen ? '' : '-rotate-90'}`}
            />
            More
          </button>
          {moreOpen && (
            <div className="space-y-0.5 mt-0.5 animate-fade-in">
              {moreNav.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setFilter(item.filter)}
                  className={`group flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] transition-all duration-200 ${
                    filter === item.filter
                      ? 'nav-active bg-primary/[0.08] font-semibold text-primary'
                      : 'text-muted-foreground hover:bg-white/[0.03] hover:text-foreground'
                  }`}
                >
                  <item.icon className={`h-[18px] w-[18px] transition-all duration-200 ${filter === item.filter ? 'text-primary' : 'text-muted-foreground/50 group-hover:text-foreground/70'}`} strokeWidth={1.8} />
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
          className="group flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] text-muted-foreground transition-all duration-200 hover:bg-white/[0.03] hover:text-foreground"
        >
          <Settings className="h-[18px] w-[18px] text-muted-foreground/50 group-hover:text-foreground/70 transition-all duration-200" strokeWidth={1.8} />
          Settings
        </Link>
      </div>

      {/* Account switcher at bottom */}
      <div className="border-t border-white/[0.04] p-3">
        <AccountSwitcher />
      </div>

      <ComposeDialog open={composeOpen} onOpenChange={setComposeOpen} />
    </aside>
  );
}
