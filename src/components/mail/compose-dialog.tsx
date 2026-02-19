'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Send, X, Minus, Trash2 } from 'lucide-react';
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
  const [showCc, setShowCc] = useState(false);
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showBcc, setShowBcc] = useState(false);
  const [sending, setSending] = useState(false);
  const [minimized, setMinimized] = useState(false);
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
          cc: cc ? cc.split(',').map((e) => e.trim()) : undefined,
          bcc: bcc ? bcc.split(',').map((e) => e.trim()) : undefined,
          subject,
          text: body,
          html: `<p>${body.replace(/\n/g, '<br/>')}</p>`,
        }),
      });
      if (!res.ok) { const err = await res.json(); alert(err.error || 'Send failed'); return; }
      onOpenChange(false);
      setTo(''); setSubject(''); setBody(''); setCc(''); setBcc('');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-0 right-6 z-50 flex flex-col animate-fade-in-scale" style={{ width: 560 }}>
      <div className="shadow-elevated rounded-t-lg border border-white/[0.06] bg-card/95 backdrop-blur-2xl overflow-hidden">
        {/* Subtle top accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.04] bg-white/[0.02] px-4 py-3 cursor-pointer"
          onClick={() => setMinimized(!minimized)}
        >
          <h3 className="text-[13px] font-semibold text-foreground tracking-tight">New Message</h3>
          <div className="flex items-center gap-0.5">
            <button
              onClick={(e) => { e.stopPropagation(); setMinimized(!minimized); }}
              className="toolbar-btn !h-6 !w-6"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onOpenChange(false); }}
              className="toolbar-btn !h-6 !w-6"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {!minimized && (
          <>
            {/* Fields */}
            <div className="divide-y divide-white/[0.03]">
              <div className="flex items-center gap-2 px-4 py-2">
                <span className="text-[13px] text-muted-foreground/40 w-8 font-medium">To</span>
                <input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="Recipients"
                  className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/25 tracking-tight"
                />
                <div className="flex gap-1.5 text-[12px] text-muted-foreground/35">
                  {!showCc && (
                    <button onClick={() => setShowCc(true)} className="hover:text-foreground/60 transition-colors">Cc</button>
                  )}
                  {!showBcc && (
                    <button onClick={() => setShowBcc(true)} className="hover:text-foreground/60 transition-colors">Bcc</button>
                  )}
                </div>
              </div>
              {showCc && (
                <div className="flex items-center gap-2 px-4 py-2">
                  <span className="text-[13px] text-muted-foreground/40 w-8 font-medium">Cc</span>
                  <input
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    className="flex-1 bg-transparent text-[13px] outline-none tracking-tight"
                  />
                </div>
              )}
              {showBcc && (
                <div className="flex items-center gap-2 px-4 py-2">
                  <span className="text-[13px] text-muted-foreground/40 w-8 font-medium">Bcc</span>
                  <input
                    value={bcc}
                    onChange={(e) => setBcc(e.target.value)}
                    className="flex-1 bg-transparent text-[13px] outline-none tracking-tight"
                  />
                </div>
              )}
              <div className="flex items-center gap-2 px-4 py-2">
                <span className="text-[13px] text-muted-foreground w-8 sr-only">Subject</span>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject"
                  className="flex-1 bg-transparent text-[13px] font-medium outline-none placeholder:text-muted-foreground/25 tracking-tight"
                />
              </div>
            </div>

            {/* Body */}
            <div className="px-4 py-3">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your email..."
                rows={12}
                className="w-full resize-none bg-transparent text-[13px] leading-relaxed outline-none placeholder:text-muted-foreground/25"
              />
            </div>

            {/* AI Compose */}
            {showAi && (
              <div className="px-4 pb-3">
                <AiCompose onInsert={(text) => { setBody(text); setShowAi(false); }} />
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center gap-2 border-t border-white/[0.04] px-4 py-3 bg-white/[0.01]">
              <Button
                onClick={handleSend}
                disabled={sending}
                size="sm"
                className="rounded-md px-5 btn-compose !shadow-none"
              >
                <Send className="mr-1.5 h-3.5 w-3.5" />
                {sending ? 'Sending...' : 'Send'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAi(!showAi)}
                className="text-muted-foreground/50 hover:text-primary rounded-md"
              >
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                AI Assist
              </Button>
              <div className="flex-1" />
              <button
                onClick={() => { onOpenChange(false); setTo(''); setSubject(''); setBody(''); }}
                className="toolbar-btn"
                title="Discard"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
