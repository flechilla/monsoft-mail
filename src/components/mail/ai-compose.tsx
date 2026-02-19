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
    <div className="rounded-xl border border-primary/10 bg-primary/[0.03] p-4">
      <div className="mb-3 flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-primary drop-shadow-[0_0_6px_rgba(59,130,246,0.4)]" />
        <span className="text-[11px] font-bold text-primary uppercase tracking-[0.12em]">AI Compose</span>
      </div>

      {/* Tone selector */}
      <div className="flex gap-1.5 mb-3">
        {tones.map((t) => (
          <button
            key={t}
            onClick={() => setTone(t)}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all duration-200 ${
              tone === t
                ? 'bg-primary text-white shadow-[0_0_12px_rgba(59,130,246,0.25)]'
                : 'bg-white/[0.04] border border-white/[0.06] text-muted-foreground hover:text-foreground hover:bg-white/[0.06]'
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
          className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[13px] outline-none focus:border-primary/20 focus:ring-1 focus:ring-primary/15 placeholder:text-muted-foreground/30 transition-all"
          disabled={isLoading}
        />
        <Button type="submit" size="sm" disabled={isLoading} className="rounded-xl">
          {isLoading ? 'Writing...' : 'Generate'}
        </Button>
      </form>

      {completion && (
        <div className="mt-3 animate-fade-in">
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3.5 text-[13px] leading-relaxed text-foreground/80 whitespace-pre-wrap">
            {completion}
          </div>
          <div className="flex gap-2 mt-2.5">
            <Button
              size="sm"
              onClick={() => onInsert(completion)}
              className="rounded-xl"
            >
              <Check className="mr-1 h-3 w-3" />
              Insert
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSubmit()}
              className="rounded-xl"
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
