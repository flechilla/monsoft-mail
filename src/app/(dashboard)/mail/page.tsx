'use client';

import { useState } from 'react';
import { EmailList } from '@/components/mail/email-list';
import { EmailView } from '@/components/mail/email-view';
import { SearchBar } from '@/components/mail/search-bar';

export default function MailPage() {
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-2">
        <SearchBar />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[400px] shrink-0 overflow-y-auto border-r">
          <EmailList
            selectedEmailId={selectedEmailId}
            onSelectEmail={setSelectedEmailId}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {selectedEmailId ? (
            <EmailView emailId={selectedEmailId} />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Select an email to read
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
