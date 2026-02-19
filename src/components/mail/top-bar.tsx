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
    <header className="glass flex h-[52px] items-center gap-4 border-b border-white/[0.05] px-4 shadow-[0_1px_0_rgba(255,255,255,0.02),0_4px_20px_-4px_rgba(0,0,0,0.3)] relative z-20">
      {/* Brand */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="glow-sm flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_2px_8px_rgba(59,130,246,0.3)]">
          <Mail className="h-4 w-4 text-white" strokeWidth={2.2} />
        </div>
        <span className="text-[15px] font-bold tracking-tight text-gradient">
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
