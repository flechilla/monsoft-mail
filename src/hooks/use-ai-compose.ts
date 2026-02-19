'use client';

import { useCompletion } from 'ai/react';

export function useAiCompose() {
  const { completion, input, handleInputChange, handleSubmit, isLoading, error } = useCompletion({
    api: '/api/ai/compose',
  });

  return {
    draft: completion,
    prompt: input,
    setPrompt: handleInputChange,
    generate: handleSubmit,
    isGenerating: isLoading,
    error,
  };
}
