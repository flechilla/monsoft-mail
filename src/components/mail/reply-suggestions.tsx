'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ReplySuggestionsProps {
  email: {
    id: string;
    from: string;
    subject: string;
    bodyText: string | null;
  };
}

interface Suggestion {
  tone: string;
  subject: string;
  body: string;
}

export function ReplySuggestions({ email }: ReplySuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function fetchSuggestions() {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/reply-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.suggestions);
        setLoaded(true);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!loaded) {
    return (
      <button
        onClick={fetchSuggestions}
        disabled={loading}
        className="flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/[0.05] px-3.5 py-1.5 text-[12px] font-medium text-primary/80 hover:bg-primary/[0.08] hover:text-primary disabled:opacity-50 transition-all duration-200"
      >
        <Sparkles className="h-3 w-3" />
        {loading ? 'Generating...' : 'Suggest replies'}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((s, i) => (
        <button
          key={i}
          className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3.5 py-1.5 text-[12px] text-foreground/70 hover:bg-white/[0.06] hover:text-foreground hover:border-white/[0.1] transition-all duration-200"
          title={s.body}
        >
          {s.body.slice(0, 55)}…
        </button>
      ))}
    </div>
  );
}
