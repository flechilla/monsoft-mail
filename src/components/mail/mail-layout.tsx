'use client';

import { Sidebar } from './sidebar';
import { MailProvider } from './mail-context';

export function MailLayout({ children }: { children: React.ReactNode }) {
  return (
    <MailProvider>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </MailProvider>
  );
}
