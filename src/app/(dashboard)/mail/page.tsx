'use client';

import { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import { EmailList } from '@/components/mail/email-list';
import { EmailView } from '@/components/mail/email-view';

export default function MailPage() {
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  return (
    <div className="flex h-full">
      {/* Email list */}
      <div className="w-[380px] shrink-0 overflow-y-auto border-r border-white/[0.04] bg-[#0a0a0d]">
        <EmailList
          selectedEmailId={selectedEmailId}
          onSelectEmail={setSelectedEmailId}
        />
      </div>

      {/* Email view / Empty state */}
      <div className="flex-1 overflow-hidden bg-[#0c0c10]">
        {selectedEmailId ? (
          <EmailView emailId={selectedEmailId} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/[0.03] border border-white/[0.04] shadow-[0_0_40px_-8px_rgba(59,130,246,0.08)]">
                <Mail className="h-8 w-8 text-muted-foreground/20" strokeWidth={1.4} />
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                <ArrowRight className="h-3.5 w-3.5 text-primary/60" />
              </div>
            </div>
            <div className="text-center space-y-1.5 mt-1">
              <p className="text-[14px] font-medium text-foreground/60">Select an email to read</p>
              <p className="text-[12px] text-muted-foreground/30">
                Use <kbd>j</kbd> / <kbd>k</kbd> to navigate
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
