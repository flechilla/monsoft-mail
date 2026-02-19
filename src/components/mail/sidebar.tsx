'use client';

import { useState } from 'react';
import {
  Inbox,
  Send,
  FileEdit,
  Star,
  Mail,
  Trash2,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AccountSwitcher } from './account-switcher';
import { ComposeDialog } from './compose-dialog';
import { useMailFilter, type MailFilter } from './mail-context';

const navItems: { label: string; icon: typeof Inbox; filter: MailFilter }[] = [
  { label: 'Inbox', icon: Inbox, filter: 'inbox' },
  { label: 'Starred', icon: Star, filter: 'starred' },
  { label: 'Sent', icon: Send, filter: 'sent' },
  { label: 'Drafts', icon: FileEdit, filter: 'drafts' },
  { label: 'All Mail', icon: Mail, filter: 'all' },
  { label: 'Spam', icon: AlertTriangle, filter: 'spam' },
  { label: 'Trash', icon: Trash2, filter: 'trash' },
];

export function Sidebar() {
  const [composeOpen, setComposeOpen] = useState(false);
  const { filter, setFilter } = useMailFilter();

  return (
    <aside className="flex w-64 flex-col border-r bg-muted/30">
      <div className="p-4">
        <AccountSwitcher />
      </div>

      <div className="px-3 pb-2">
        <Button
          className="w-full justify-start gap-2"
          onClick={() => setComposeOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Compose
        </Button>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setFilter(item.filter)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              filter === item.filter
                ? 'bg-primary/10 font-medium text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>

      <ComposeDialog open={composeOpen} onOpenChange={setComposeOpen} />
    </aside>
  );
}
