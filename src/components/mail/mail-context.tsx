'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

export type MailFilter = 'inbox' | 'sent' | 'drafts' | 'starred' | 'all' | 'spam' | 'trash';

interface MailContextType {
  filter: MailFilter;
  setFilter: (f: MailFilter) => void;
}

const MailContext = createContext<MailContextType>({
  filter: 'inbox',
  setFilter: () => {},
});

export function MailProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<MailFilter>('inbox');
  return (
    <MailContext.Provider value={{ filter, setFilter }}>
      {children}
    </MailContext.Provider>
  );
}

export function useMailFilter() {
  return useContext(MailContext);
}
