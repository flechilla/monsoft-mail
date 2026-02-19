'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Send, X } from 'lucide-react';
import { AiCompose } from './ai-compose';

interface ComposeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId?: string;
}

export function ComposeDialog({ open, onOpenChange, accountId: propAccountId }: ComposeDialogProps) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [showAi, setShowAi] = useState(false);
  const [sending, setSending] = useState(false);
  const [accountId, setAccountId] = useState(propAccountId || '');

  useEffect(() => {
    if (!accountId && open) {
      fetch('/api/accounts')
        .then((r) => r.json())
        .then((data) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const defaultAcc = data.accounts?.find((a: any) => a.isDefault) || data.accounts?.[0];
          if (defaultAcc) setAccountId(defaultAcc.id);
        })
        .catch(console.error);
    }
  }, [open, accountId]);

  if (!open) return null;

  async function handleSend() {
    if (!accountId) { alert('No email account configured'); return; }
    setSending(true);
    try {
      const res = await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          to: to.split(',').map((e) => e.trim()),
          subject,
          text: body,
          html: `<p>${body.replace(/\n/g, '<br/>')}</p>`,
        }),
      });
      if (!res.ok) { const err = await res.json(); alert(err.error || 'Send failed'); return; }
      onOpenChange(false);
      setTo('');
      setSubject('');
      setBody('');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4">
      <div className="w-[560px] rounded-t-xl border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <h3 className="text-sm font-semibold">New Message</h3>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 p-4">
          <div>
            <Label htmlFor="to" className="text-xs text-muted-foreground">
              To
            </Label>
            <Input
              id="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="subject" className="text-xs text-muted-foreground">
              Subject
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="mt-1"
            />
          </div>
          <div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email..."
              rows={10}
              className="w-full resize-none rounded-md border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {showAi && (
            <AiCompose onInsert={(text) => { setBody(text); setShowAi(false); }} />
          )}
        </div>

        <div className="flex items-center justify-between border-t px-4 py-2">
          <div className="flex gap-2">
            <Button onClick={handleSend} disabled={sending} size="sm">
              <Send className="mr-1 h-4 w-4" />
              {sending ? 'Sending...' : 'Send'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAi(!showAi)}
            >
              <Sparkles className="mr-1 h-4 w-4" />
              AI Assist
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
