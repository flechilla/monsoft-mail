'use client';

import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';
import { MailProvider } from './mail-context';

export function MailLayout({ children }: { children: React.ReactNode }) {
  return (
    <MailProvider>
      <div className="flex h-screen flex-col bg-background">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
      </div>
    </MailProvider>
  );
}
