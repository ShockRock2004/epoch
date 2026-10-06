// Pure scheduling logic. Dates are local calendar keys ("yyyy-mm-dd"), never Date objects,
// so nothing here depends on the device timezone.
import { EPISODES, TOTAL, RING_CLUSTERS, ringMembers } from '../data/plan';

export type DayLog = { base: number[]; revealed: number[] };
export type Progress = {
  start: string;
  done: Record<number, string>; // episode → day it was finished
  days: Record<string, DayLog>;
};

export const PLAN_DAYS = 50;
export const MAX_REVEALS = 2;

export const fresh = (start: string): Progress => ({ start, done: {}, days: {} });

export const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const toUTC = (k: string) => {
  const [y, m, d] = k.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};

export const addDays = (k: string, n: number) => {
  const d = new Date(toUTC(k) + n * 86400000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
};

export const diffDays = (a: string, b: string) => Math.round((toUTC(b) - toUTC(a)) / 86400000);

// Day 1 is the start date; days before it are negative (no Day 0).
export const dayNumber = (start: string, today: string) => {
  const d = diffDays(start, today);
  return d >= 0 ? d + 1 : d;
};

const unfinished = (p: Progress, skip: number[] = []) =>
  EPISODES.map(e => e.n).filter(n => !p.done[n] && !skip.includes(n));

export const ensureDay = (p: Progress, today: string): Progress => {
  if (p.days[today]) return p;
  return { ...p, days: { ...p.days, [today]: { base: unfinished(p).slice(0, 2), revealed: [] } } };
};

export type TodayView = {
  shown: number[];
  canReveal: boolean;
  allDoneForToday: boolean; // both reveals used and everything shown is finished
  finishedPlan: boolean;
};

export const todayView = (p: Progress, today: string): TodayView => {
  const log = p.days[today] ?? { base: [], revealed: [] };
  const shown = [...log.base, ...log.revealed];
  const shownDone = shown.every(n => p.done[n]);
  const left = unfinished(p, shown).length;
  const finishedPlan = Object.keys(p.done).length >= TOTAL;
  return {
    shown,
    canReveal: shownDone && log.revealed.length < MAX_REVEALS && left > 0,
    allDoneForToday: shownDone && log.revealed.length >= MAX_REVEALS && !finishedPlan,
    finishedPlan,
  };
};

export const reveal = (p: Progress, today: string): Progress => {
  const v = todayView(p, today);
  if (!v.canReveal) return p;
  const next = unfinished(p, v.shown)[0];
  const log = p.days[today];
  return { ...p, days: { ...p.days, [today]: { ...log, revealed: [...log.revealed, next] } } };
};

export const toggleDone = (p: Progress, n: number, today: string): Progress => {
  const done = { ...p.done };
  if (done[n]) delete done[n];
  else done[n] = today;
  return { ...p, done };
};

// Episodes finished on each of the 50 plan days.
export const activity = (p: Progress, days = PLAN_DAYS) => {
  const out = new Array(days).fill(0);
  for (const k of Object.values(p.done)) {
    const i = diffDays(p.start, k);
    if (i >= 0 && i < days) out[i]++;
  }
  return out;
};

export const episodesOn = (p: Progress, k: string) =>
  Object.entries(p.done).filter(([, d]) => d === k).map(([n]) => +n).sort((a, b) => a - b);

export const streaks = (p: Progress, today: string) => {
  const active = new Set(Object.values(p.done));
  const sorted = [...active].sort();
  let best = 0, run = 0, prev = '';
  for (const k of sorted) {
    run = prev && diffDays(prev, k) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = k;
  }
  // The streak survives until the end of the day after the last active day.
  let cur = 0;
  let k = active.has(today) ? today : addDays(today, -1);
  while (active.has(k)) { cur++; k = addDays(k, -1); }
  return { current: cur, best };
};

export const ringProgress = (p: Progress) =>
  RING_CLUSTERS.map(c => {
    const rings = c.rings.map(g => {
      const ns = ringMembers(g);
      const d = ns.filter(n => p.done[n]).length;
      return { ...g, total: ns.length, done: d, frac: d / ns.length };
    });
    const total = rings.reduce((a, r) => a + r.total, 0);
    const done = rings.reduce((a, r) => a + r.done, 0);
    return { title: c.title, rings, total, done, frac: done / total };
  });

export const hoursWatched = (p: Progress) =>
  EPISODES.reduce((a, e) => a + (p.done[e.n] ? e.secs : 0), 0) / 3600;

export const totalHours = () => EPISODES.reduce((a, e) => a + e.secs, 0) / 3600;
