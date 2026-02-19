'use client';

import { useState } from 'react';
import { Search, X, Command } from 'lucide-react';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`relative flex items-center w-full max-w-md rounded-md border transition-all duration-300 ${
        focused
          ? 'border-primary/20 bg-white/[0.04] shadow-[0_0_0_3px_rgba(59,130,246,0.06),0_0_20px_-4px_rgba(59,130,246,0.1)]'
          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.08] hover:bg-white/[0.03]'
      }`}
    >
      <Search className={`absolute left-3 h-3.5 w-3.5 transition-colors duration-200 ${focused ? 'text-primary/80' : 'text-muted-foreground/35'}`} strokeWidth={2} />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search mail..."
        className="h-8 w-full bg-transparent pl-9 pr-16 text-[13px] outline-none placeholder:text-muted-foreground/30 tracking-tight"
      />
      {query ? (
        <button
          onClick={() => setQuery('')}
          className="absolute right-2.5 flex h-5 w-5 items-center justify-center rounded-md transition-all hover:bg-white/[0.06]"
        >
          <X className="h-3 w-3 text-muted-foreground/50" />
        </button>
      ) : (
        <div className="absolute right-2.5 flex items-center gap-0.5 pointer-events-none">
          <kbd className="!border-white/[0.08] !bg-white/[0.03] !text-muted-foreground/30 !text-[10px] !px-1 !py-0 !shadow-none">
            <Command className="h-2.5 w-2.5 inline" />
          </kbd>
          <kbd className="!border-white/[0.08] !bg-white/[0.03] !text-muted-foreground/30 !text-[10px] !px-1.5 !py-0 !shadow-none">
            K
          </kbd>
        </div>
      )}
    </div>
  );
}
