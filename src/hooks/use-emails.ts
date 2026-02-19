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
  cc: string[] | null;
  bcc: string[] | null;
  subject: string;
  bodyHtml: string | null;
  bodyText: string | null;
  snippet: string | null;
  isRead: boolean;
  isStarred: boolean;
  status: string;
  aiSummary: string | null;
  aiCategory: string | null;
  aiPriority: number | null;
  sentAt: string | null;
  receivedAt: string | null;
  createdAt: string;
}

interface UseEmailsParams {
  accountId?: string;
  isRead?: boolean;
  direction?: 'inbound' | 'outbound';
  isStarred?: boolean;
  status?: string;
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
      if (params.direction) sp.set('direction', params.direction);
      if (params.isStarred !== undefined) sp.set('isStarred', String(params.isStarred));
      if (params.status) sp.set('status', params.status);
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
  }, [params.accountId, params.isRead, params.direction, params.isStarred, params.status, params.page, params.limit]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  return { emails, total, loading, error, refetch: fetchEmails };
}
