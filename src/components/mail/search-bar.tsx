'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`glass relative flex items-center w-full max-w-lg rounded-full border transition-all duration-200 ${
        focused
          ? 'border-primary/25 shadow-[0_0_0_3px_rgba(59,130,246,0.08)] ring-1 ring-primary/15'
          : 'border-border/40 hover:border-border/60'
      }`}
    >
      <Search className={`absolute left-3.5 h-4 w-4 transition-colors duration-200 ${focused ? 'text-primary/70' : 'text-muted-foreground/50'}`} />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search mail..."
        className="h-9 w-full bg-transparent pl-10 pr-10 text-sm outline-none placeholder:text-muted-foreground/40 tracking-tight"
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full transition-all hover:bg-muted/40"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground/60" />
        </button>
      )}
    </div>
  );
}
