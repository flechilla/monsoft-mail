'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        className="flex w-full items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm hover:bg-muted"
      >
        <div className="truncate text-left">
          <div className="font-medium">{selected?.name || 'No account'}</div>
          <div className="text-xs text-muted-foreground">{selected?.email || 'Add an account'}</div>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-lg border bg-background shadow-lg">
          {accounts.map((account) => (
            <button
              key={account.id}
              onClick={() => { setSelected(account); setOpen(false); }}
              className={`flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-muted ${
                selected?.id === account.id ? 'bg-primary/5' : ''
              }`}
            >
              <span className="font-medium">{account.name}</span>
              <span className="text-xs text-muted-foreground">{account.email}</span>
            </button>
          ))}
          <button
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 border-t px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            <Plus className="h-3 w-3" />
            Add account
          </button>
        </div>
      )}
    </div>
  );
}
