'use client';

import { Mail, RefreshCw, Settings, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { SearchBar } from './search-bar';
import { signOut } from '@/lib/auth/client';
import { useSidebar } from './sidebar-context';

export function TopBar() {
  const [rotating, setRotating] = useState(false);
  const { setMobileOpen } = useSidebar();

  function handleRefresh() {
    setRotating(true);
    window.location.reload();
  }

  return (
    <header className="flex h-[52px] items-center gap-4 border-b border-white/[0.06] bg-background px-4 relative z-20">
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="toolbar-btn md:hidden shrink-0"
        title="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Brand */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          <Mail className="h-3.5 w-3.5 text-white" strokeWidth={2.2} />
        </div>
        <span className="text-[14px] font-semibold tracking-tight text-foreground">
          Monsoft Mail
        </span>
      </div>

      {/* Search */}
      <div className="flex-1 flex justify-center">
        <SearchBar />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={handleRefresh}
          className="toolbar-btn"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${rotating ? 'animate-spin' : ''}`} />
        </button>
        <button
          className="toolbar-btn"
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
        <div className="mx-1.5 h-4 w-px bg-white/[0.06]" />
        <button
          onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/login'; } } })}
          className="toolbar-btn"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
