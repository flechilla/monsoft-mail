'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { EmailList } from '@/components/mail/email-list';
import { EmailView } from '@/components/mail/email-view';

export default function MailPage() {
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  return (
    <div className="flex h-full">
      {/* Email list */}
      <div className="w-[380px] shrink-0 overflow-y-auto border-r border-border bg-background">
        <EmailList
          selectedEmailId={selectedEmailId}
          onSelectEmail={setSelectedEmailId}
        />
      </div>

      {/* Email view / Empty state */}
      <div className="flex-1 overflow-hidden bg-background">
        {selectedEmailId ? (
          <EmailView emailId={selectedEmailId} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Mail className="h-7 w-7 opacity-40" />
            </div>
            <p className="text-sm">Select an email to read</p>
            <p className="text-[12px] text-muted-foreground/60">
              Use <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] font-mono">j</kbd> / <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] font-mono">k</kbd> to navigate
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
