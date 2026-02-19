'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { MailAvatar } from './avatar';

interface Account {
  id: string;
  email: string;
  name: string;
  isDefault: boolean;
}

export function AccountSwitcher() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selected, setSelected] = useState<Account | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch('/api/accounts')
      .then((r) => r.json())
      .then((data) => {
        setAccounts(data.accounts || []);
        const def = data.accounts?.find((a: Account) => a.isDefault) || data.accounts?.[0];
        if (def) setSelected(def);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm hover:bg-muted"
      >
        <MailAvatar
          email={selected?.email || ''}
          name={selected?.name}
          size="sm"
        />
        <div className="flex-1 truncate text-left">
          <div className="text-[13px] font-medium text-foreground truncate">
            {selected?.name || 'No account'}
          </div>
          <div className="text-[11px] text-muted-foreground font-mono truncate">
            {selected?.email || 'Add an account'}
          </div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1 w-full rounded-lg border border-border bg-background shadow-lg z-50">
          {accounts.map((account) => (
            <button
              key={account.id}
              onClick={() => { setSelected(account); setOpen(false); }}
              className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-muted ${
                selected?.id === account.id ? 'bg-primary/5' : ''
              }`}
            >
              <MailAvatar email={account.email} name={account.name} size="sm" />
              <div className="truncate">
                <div className="text-[13px] font-medium">{account.name}</div>
                <div className="text-[11px] text-muted-foreground font-mono">{account.email}</div>
              </div>
            </button>
          ))}
          <button
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 border-t border-border px-3 py-2.5 text-[13px] text-muted-foreground hover:bg-muted"
          >
            <Plus className="h-3.5 w-3.5" />
            Add account
          </button>
        </div>
      )}
    </div>
  );
}
