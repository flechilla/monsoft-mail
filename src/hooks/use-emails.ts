'use client';

import { useState, useEffect, useCallback } from 'react';

interface Email {
  id: string;
  accountId: string;
  threadId: string | null;
  messageId: string | null;
  direction: 'inbound' | 'outbound';
  from: string;
  to: string[];
  subject: string;
  snippet: string | null;
  isRead: boolean;
  isStarred: boolean;
  status: string;
  aiCategory: string | null;
  aiPriority: number | null;
  receivedAt: string | null;
  createdAt: string;
}

interface UseEmailsParams {
  accountId?: string;
  isRead?: boolean;
  page?: number;
  limit?: number;
}

export function useEmails(params: UseEmailsParams = {}) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (params.accountId) sp.set('accountId', params.accountId);
      if (params.isRead !== undefined) sp.set('isRead', String(params.isRead));
      sp.set('page', String(params.page || 1));
      sp.set('limit', String(params.limit || 50));

      const res = await fetch(`/api/emails?${sp}`);
      if (!res.ok) throw new Error('Failed to fetch emails');
      const data = await res.json();
      setEmails(data.emails);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [params.accountId, params.isRead, params.page, params.limit]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  return { emails, total, loading, error, refetch: fetchEmails };
}
