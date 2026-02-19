'use client';

import { useState, useEffect, useCallback } from 'react';

interface Thread {
  id: string;
  accountId: string;
  subject: string;
  lastMessageAt: string;
  messageCount: number;
  isRead: boolean;
  isStarred: boolean;
  snippet: string | null;
  aiSummary: string | null;
  labels: string[];
}

interface UseThreadsParams {
  accountId?: string;
  page?: number;
  limit?: number;
}

export function useThreads(params: UseThreadsParams = {}) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchThreads = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (params.accountId) sp.set('accountId', params.accountId);
      sp.set('page', String(params.page || 1));
      sp.set('limit', String(params.limit || 50));

      const res = await fetch(`/api/threads?${sp}`);
      if (!res.ok) throw new Error('Failed to fetch threads');
      const data = await res.json();
      setThreads(data.threads);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [params.accountId, params.page, params.limit]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  return { threads, total, loading, error, refetch: fetchThreads };
}
