'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
        className="flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50/50 px-3 py-1.5 text-[12px] font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
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
          className="rounded-full border border-border bg-muted/50 px-3.5 py-1.5 text-[12px] text-foreground hover:bg-muted hover:shadow-sm"
          title={s.body}
        >
          {s.body.slice(0, 55)}…
        </button>
      ))}
    </div>
  );
}
