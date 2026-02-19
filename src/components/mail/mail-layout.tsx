'use client';

import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';
import { MailProvider } from './mail-context';
import { SidebarProvider } from './sidebar-context';

export function MailLayout({ children }: { children: React.ReactNode }) {
  return (
    <MailProvider>
      <SidebarProvider>
        <div className="noise-overlay flex h-screen flex-col bg-background">
          <TopBar />
          <div className="flex flex-1 overflow-hidden relative z-10">
            <Sidebar />
            <main className="flex-1 overflow-hidden">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </MailProvider>
  );
}
