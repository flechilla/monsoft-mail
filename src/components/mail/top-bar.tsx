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
    <header className="flex h-14 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4">
      {/* Brand */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Mail className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-semibold text-foreground tracking-tight">
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
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground hover:scale-105 active:scale-95"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${rotating ? 'animate-spin' : ''}`} />
        </button>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground hover:scale-105 active:scale-95"
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
        <button
          onClick={() => signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/login'; } } })}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground hover:scale-105 active:scale-95"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
