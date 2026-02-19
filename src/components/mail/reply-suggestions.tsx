'use client';

import { useState, useEffect } from 'react';
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
      <Button
        variant="ghost"
        size="sm"
        onClick={fetchSuggestions}
        disabled={loading}
        className="text-xs"
      >
        <Sparkles className="mr-1 h-3 w-3" />
        {loading ? 'Generating...' : 'Suggest replies'}
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((s, i) => (
        <button
          key={i}
          className="rounded-full border bg-muted/50 px-3 py-1 text-xs transition-colors hover:bg-muted"
          title={s.body}
        >
          {s.tone}: {s.body.slice(0, 60)}...
        </button>
      ))}
    </div>
  );
}
