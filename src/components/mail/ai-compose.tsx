'use client';

import { useState } from 'react';
import { useCompletion } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Sparkles, Check, RefreshCw } from 'lucide-react';

interface AiComposeProps {
  onInsert: (text: string) => void;
}

const tones = ['Professional', 'Formal', 'Casual', 'Friendly'] as const;

export function AiCompose({ onInsert }: AiComposeProps) {
  const [tone, setTone] = useState<string>('Professional');
  const { completion, input, handleInputChange, handleSubmit, isLoading } =
    useCompletion({ api: '/api/ai/compose' });

  return (
    <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-4">
      <div className="mb-3 flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-blue-500" />
        <span className="text-[12px] font-semibold text-blue-600 uppercase tracking-wider">AI Compose</span>
      </div>

      {/* Tone selector */}
      <div className="flex gap-1.5 mb-3">
        {tones.map((t) => (
          <button
            key={t}
            onClick={() => setTone(t)}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
              tone === t
                ? 'bg-primary text-white'
                : 'bg-white border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Describe what you want to write..."
          className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/20"
          disabled={isLoading}
        />
        <Button type="submit" size="sm" disabled={isLoading} className="rounded-lg">
          {isLoading ? 'Writing...' : 'Generate'}
        </Button>
      </form>

      {completion && (
        <div className="mt-3">
          <div className="rounded-lg bg-white border border-border p-3 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {completion}
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              size="sm"
              onClick={() => onInsert(completion)}
              className="rounded-lg"
            >
              <Check className="mr-1 h-3 w-3" />
              Insert
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSubmit()}
              className="rounded-lg"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Regenerate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
