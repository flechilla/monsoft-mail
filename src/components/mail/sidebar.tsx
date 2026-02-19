'use client';

import { useState, useEffect } from 'react';
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
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { AccountSwitcher } from './account-switcher';
import { ComposeDialog } from './compose-dialog';
import { useMailFilter, type MailFilter } from './mail-context';
import { useSidebar } from './sidebar-context';

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

function SidebarContent({ collapsed, onNavClick }: { collapsed: boolean; onNavClick?: () => void }) {
  const [composeOpen, setComposeOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { filter, setFilter } = useMailFilter();

  function handleFilter(f: MailFilter) {
    setFilter(f);
    onNavClick?.();
  }

  return (
    <>
      {/* Compose button */}
      <div className="p-3 pt-4">
        <button
          onClick={() => setComposeOpen(true)}
          className={`btn-compose flex items-center justify-center gap-2.5 rounded-md text-[13px] font-semibold text-white tracking-tight transition-all duration-300 hover:shadow-[0_4px_20px_-4px_rgba(59,130,246,0.4)] active:scale-[0.98] ${
            collapsed ? 'w-10 h-10 mx-auto px-0 py-0' : 'w-full px-4 py-2.5'
          }`}
          title={collapsed ? 'Compose' : undefined}
        >
          <PenSquare className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Compose</span>}
        </button>
      </div>

      {/* Primary navigation */}
      <nav className="flex-1 px-2 mt-1">
        {!collapsed && (
          <p className="mb-1.5 px-3 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/40">
            Mail
          </p>
        )}
        <div className="space-y-0.5">
          {primaryNav.map((item) => (
            <button
              key={item.label}
              onClick={() => handleFilter(item.filter)}
              className={`nav-item group flex w-full items-center rounded-md transition-all duration-200 ${
                collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
              } text-[13px] ${
                filter === item.filter
                  ? 'nav-active bg-primary/[0.08] font-semibold text-primary'
                  : 'text-muted-foreground hover:bg-white/[0.03] hover:text-foreground'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                className={`h-[18px] w-[18px] shrink-0 transition-all duration-200 ${
                  filter === item.filter
                    ? 'text-primary'
                    : 'text-muted-foreground/50 group-hover:text-foreground/70'
                }`}
                strokeWidth={filter === item.filter ? 2.2 : 1.8}
              />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.filter === 'inbox' && (
                    <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-primary">
                      3
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </div>

        {/* More section */}
        {!collapsed ? (
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
                    onClick={() => handleFilter(item.filter)}
                    className={`group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[13px] transition-all duration-200 ${
                      filter === item.filter
                        ? 'nav-active bg-primary/[0.08] font-semibold text-primary'
                        : 'text-muted-foreground hover:bg-white/[0.03] hover:text-foreground'
                    }`}
                  >
                    <item.icon
                      className={`h-[18px] w-[18px] transition-all duration-200 ${
                        filter === item.filter
                          ? 'text-primary'
                          : 'text-muted-foreground/50 group-hover:text-foreground/70'
                      }`}
                      strokeWidth={1.8}
                    />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-3 space-y-0.5">
            {moreNav.map((item) => (
              <button
                key={item.label}
                onClick={() => handleFilter(item.filter)}
                className={`group flex w-full items-center justify-center rounded-md px-0 py-2.5 text-[13px] transition-all duration-200 ${
                  filter === item.filter
                    ? 'nav-active bg-primary/[0.08] font-semibold text-primary'
                    : 'text-muted-foreground hover:bg-white/[0.03] hover:text-foreground'
                }`}
                title={item.label}
              >
                <item.icon
                  className={`h-[18px] w-[18px] shrink-0 transition-all duration-200 ${
                    filter === item.filter
                      ? 'text-primary'
                      : 'text-muted-foreground/50 group-hover:text-foreground/70'
                  }`}
                  strokeWidth={1.8}
                />
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Settings link */}
      <div className="px-2 pb-1">
        <Link
          href="/settings"
          className={`group flex w-full items-center rounded-md text-[13px] text-muted-foreground transition-all duration-200 hover:bg-white/[0.03] hover:text-foreground ${
            collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
          }`}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings
            className="h-[18px] w-[18px] shrink-0 text-muted-foreground/50 group-hover:text-foreground/70 transition-all duration-200"
            strokeWidth={1.8}
          />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>

      {/* Account switcher at bottom */}
      {!collapsed && (
        <div className="border-t border-white/[0.04] p-3">
          <AccountSwitcher />
        </div>
      )}

      <ComposeDialog open={composeOpen} onOpenChange={setComposeOpen} />
    </>
  );
}

export function Sidebar() {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  // Close mobile drawer on escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && mobileOpen) setMobileOpen(false);
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, setMobileOpen]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`sidebar-ambient hidden md:flex shrink-0 flex-col bg-[#08080b]/95 backdrop-blur-2xl border-r border-white/[0.04] transition-[width] duration-300 ease-in-out ${
          collapsed ? 'w-[60px]' : 'w-[240px]'
        }`}
      >
        <SidebarContent collapsed={collapsed} />

        {/* Collapse toggle */}
        <div className="px-2 pb-3">
          <button
            onClick={toggleCollapsed}
            className="group flex w-full items-center justify-center rounded-md px-0 py-2 text-muted-foreground/30 transition-all duration-200 hover:bg-white/[0.03] hover:text-muted-foreground/60"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" strokeWidth={1.8} />
            ) : (
              <PanelLeftClose className="h-4 w-4" strokeWidth={1.8} />
            )}
          </button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-[#08080b]/98 backdrop-blur-2xl border-r border-white/[0.04] md:hidden transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button */}
        <div className="flex items-center justify-end p-2">
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-white/[0.05] hover:text-foreground/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <SidebarContent collapsed={false} onNavClick={() => setMobileOpen(false)} />
      </aside>
    </>
  );
}
