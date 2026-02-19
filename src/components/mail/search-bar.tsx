'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`relative flex items-center w-full max-w-lg rounded-full border bg-muted/50 transition-all ${
        focused ? 'border-primary/30 bg-background shadow-sm ring-1 ring-primary/20' : 'border-transparent'
      }`}
    >
      <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search mail"
        className="h-10 w-full bg-transparent pl-10 pr-10 text-sm outline-none placeholder:text-muted-foreground"
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full hover:bg-muted"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
