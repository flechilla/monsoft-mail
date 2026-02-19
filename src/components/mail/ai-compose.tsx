'use client';

import { useState } from 'react';
import { useCompletion } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Check } from 'lucide-react';

interface AiComposeProps {
  onInsert: (text: string) => void;
}

export function AiCompose({ onInsert }: AiComposeProps) {
  const { completion, input, handleInputChange, handleSubmit, isLoading } =
    useCompletion({ api: '/api/ai/compose' });

  return (
    <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3">
      <div className="mb-2 flex items-center gap-1 text-xs font-medium text-primary">
        <Sparkles className="h-3 w-3" />
        AI Compose
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Describe what you want to write..."
          className="text-sm"
          disabled={isLoading}
        />
        <Button type="submit" size="sm" disabled={isLoading}>
          {isLoading ? 'Writing...' : 'Generate'}
        </Button>
      </form>
      {completion && (
        <div className="mt-3">
          <pre className="whitespace-pre-wrap rounded bg-background p-2 text-sm">
            {completion}
          </pre>
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={() => onInsert(completion)}
          >
            <Check className="mr-1 h-3 w-3" />
            Insert
          </Button>
        </div>
      )}
    </div>
  );
}
