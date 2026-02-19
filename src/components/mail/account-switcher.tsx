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
        className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-all duration-200 hover:bg-white/[0.03]"
      >
        <MailAvatar
          email={selected?.email || ''}
          name={selected?.name}
          size="sm"
        />
        <div className="flex-1 truncate text-left">
          <div className="text-[13px] font-medium text-foreground/90 truncate tracking-tight">
            {selected?.name || 'No account'}
          </div>
          <div className="text-[11px] text-muted-foreground/35 font-mono truncate">
            {selected?.email || 'Add an account'}
          </div>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-muted-foreground/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="shadow-elevated absolute bottom-full left-0 mb-2 w-full rounded-xl border border-white/[0.06] bg-card/95 backdrop-blur-2xl z-50 overflow-hidden animate-fade-in-scale">
          {accounts.map((account) => (
            <button
              key={account.id}
              onClick={() => { setSelected(account); setOpen(false); }}
              className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-all duration-150 hover:bg-white/[0.03] ${
                selected?.id === account.id ? 'bg-primary/[0.05]' : ''
              }`}
            >
              <MailAvatar email={account.email} name={account.name} size="sm" />
              <div className="truncate">
                <div className="text-[13px] font-medium tracking-tight text-foreground/90">{account.name}</div>
                <div className="text-[11px] text-muted-foreground/35 font-mono">{account.email}</div>
              </div>
            </button>
          ))}
          <button
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 border-t border-white/[0.04] px-3 py-2.5 text-[13px] text-muted-foreground/40 transition-all duration-150 hover:bg-white/[0.03] hover:text-foreground/70"
          >
            <Plus className="h-3.5 w-3.5" />
            Add account
          </button>
        </div>
      )}
    </div>
  );
}
