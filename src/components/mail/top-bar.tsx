'use client';

import { Mail, RefreshCw, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';
import { SearchBar } from './search-bar';
import { signOut } from '@/lib/auth/client';

export function TopBar() {
  const [rotating, setRotating] = useState(false);

  function handleRefresh() {
    setRotating(true);
    window.location.reload();
  }

  return (
    <header className="glass flex h-14 items-center gap-4 border-b border-border/30 px-4">
      {/* Brand */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="glow-sm flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Mail className="h-4 w-4 text-white" />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-gradient">
          Monsoft Mail
        </span>
      </div>

      {/* Search */}
      <div className="flex-1 flex justify-center">
        <SearchBar />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={handleRefresh}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/70 transition-all duration-200 hover:bg-muted/40 hover:text-foreground hover:scale-105 active:scale-95"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${rotating ? 'animate-spin' : ''}`} />
        </button>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/70 transition-all duration-200 hover:bg-muted/40 hover:text-foreground hover:scale-105 active:scale-95"
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
        <button
          onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/login'; } } })}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/70 transition-all duration-200 hover:bg-muted/40 hover:text-foreground hover:scale-105 active:scale-95"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
