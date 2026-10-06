import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Progress, fresh, ensureDay, reveal as revealFn, toggleDone as toggleFn, dateKey } from './schedule';

const KEY = 'epoch:v1';
export const DEFAULT_START = '2026-10-07';

type Store = {
  ready: boolean;
  p: Progress;
  today: string;
  toggle: (n: number) => void;
  reveal: () => void;
  setStart: (k: string) => void;
  reset: () => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [today, setToday] = useState(() => dateKey(new Date()));
  const [p, setP] = useState<Progress>(() => fresh(DEFAULT_START));
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(raw => {
        if (raw) {
          const s = JSON.parse(raw) as Progress;
          if (s && s.start && s.done && s.days) setP(s);
        }
      })
      .catch(() => {})
      .finally(() => { loaded.current = true; setReady(true); });
  }, []);

  // A new calendar day can begin while the app sits in the background.
  useEffect(() => {
    const sub = AppState.addEventListener('change', st => {
      if (st === 'active') setToday(dateKey(new Date()));
    });
    return () => sub.remove();
  }, []);

  // Freeze today's base the first time the day is seen.
  useEffect(() => {
    if (ready) setP(s => ensureDay(s, today));
  }, [ready, today]);

  useEffect(() => {
    if (loaded.current) AsyncStorage.setItem(KEY, JSON.stringify(p)).catch(() => {});
  }, [p]);

  const toggle = useCallback((n: number) => setP(s => toggleFn(s, n, today)), [today]);
  const reveal = useCallback(() => setP(s => revealFn(s, today)), [today]);
  const setStart = useCallback((k: string) => setP(s => ({ ...s, start: k })), []);
  const reset = useCallback(() => setP(s => ensureDay(fresh(s.start), today)), [today]);

  const value = useMemo(() => ({ ready, p, today, toggle, reveal, setStart, reset }), [ready, p, today, toggle, reveal, setStart, reset]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore outside StoreProvider');
  return s;
};
