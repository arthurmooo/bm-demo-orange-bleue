import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ClubId, DebtStage } from '@/data/demo';

type Store = {
  club: ClubId | 'all';
  setClub: (c: ClubId | 'all') => void;
  /** Éléments traités pendant la démo (file d'attention, messages envoyés, bilans saisis…). */
  done: Record<string, boolean>;
  markDone: (id: string, v?: boolean) => void;
  /** Étape des impayés modifiée pendant la démo. */
  debtStage: Record<string, DebtStage>;
  setDebtStage: (id: string, s: DebtStage) => void;
  /** Journal de la démo : ce que le système a fait et qui l'a validé. */
  log: { at: Date; text: string; who: string }[];
  addLog: (text: string, who?: string) => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [club, setClub] = useState<ClubId | 'all'>('all');
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [debtStage, setDS] = useState<Record<string, DebtStage>>({});
  const [log, setLog] = useState<Store['log']>([]);
  const markDone = useCallback((id: string, v = true) => setDone((d) => ({ ...d, [id]: v })), []);
  const setDebtStage = useCallback((id: string, s: DebtStage) => setDS((d) => ({ ...d, [id]: s })), []);
  const addLog = useCallback((text: string, who = 'NI') => setLog((l) => [{ at: new Date(), text, who }, ...l]), []);
  const value = useMemo(() => ({ club, setClub, done, markDone, debtStage, setDebtStage, log, addLog }), [club, done, markDone, debtStage, setDebtStage, log, addLog]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('StoreProvider manquant');
  return s;
}
