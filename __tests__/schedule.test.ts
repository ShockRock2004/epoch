import { EPISODES, TOTAL, RING_CLUSTERS, ringMembers } from '../src/data/plan';
import {
  Progress, fresh, ensureDay, toggleDone, dayNumber, addDays,
  activity, streaks, ringProgress, hoursWatched, goHyper, modeOf, planDays,
} from '../src/lib/schedule';

const D1 = '2026-10-07';
const done = (p: Progress, ns: number[], on = D1) => ns.reduce((s, n) => toggleDone(s, n, on), p);

describe('plan data', () => {
  test('has 100 episodes numbered 1..100', () => {
    expect(TOTAL).toBe(100);
    EPISODES.forEach((e, i) => expect(e.n).toBe(i + 1));
  });
  test('every slice is inside its video and episodes run 15–40 min', () => {
    for (const e of EPISODES) {
      for (const s of e.segs) {
        expect(s.start).toBeGreaterThanOrEqual(0);
        expect(s.end).toBeGreaterThan(s.start);
        expect(s.end).toBeLessThanOrEqual(s.len);
      }
      expect(e.secs).toBeGreaterThan(14 * 60);
      expect(e.secs).toBeLessThan(40 * 60);
    }
  });
  test('every episode has 2–4 short bullet points', () => {
    for (const e of EPISODES) {
      expect(e.points.length).toBeGreaterThanOrEqual(2);
      expect(e.points.length).toBeLessThanOrEqual(4);
      for (const b of e.points) expect(b.length).toBeLessThanOrEqual(130);
    }
  });
  test('ring groups cover every episode exactly once', () => {
    const all = RING_CLUSTERS.flatMap(c => c.rings.flatMap(ringMembers)).sort((a, b) => a - b);
    expect(all).toEqual(EPISODES.map(e => e.n));
  });
});

describe('dates', () => {
  test('day number counts calendar days from start', () => {
    expect(dayNumber(D1, D1)).toBe(1);
    expect(dayNumber(D1, '2026-10-31')).toBe(25);
    expect(dayNumber(D1, '2026-11-25')).toBe(50);
    expect(dayNumber(D1, '2026-10-05')).toBe(-2); // two days before the start
  });
  test('addDays crosses months', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-11-01', -1)).toBe('2026-10-31');
  });
});

describe('daily queue', () => {
  const shown = (p: Progress, k: string) => p.days[k].base;

  test('first day shows episodes 1 and 2', () => {
    expect(shown(ensureDay(fresh(D1), D1), D1)).toEqual([1, 2]);
  });

  test('carry-over: finishing only ep 1 shows 2 and 3 tomorrow', () => {
    let p = ensureDay(fresh(D1), D1);
    p = done(p, [1]);
    const d2 = addDays(D1, 1);
    expect(shown(ensureDay(p, d2), d2)).toEqual([2, 3]);
  });

  test('base is frozen for the day, so finished cards stay put', () => {
    let p = ensureDay(fresh(D1), D1);
    p = done(p, [1]);
    expect(shown(ensureDay(p, D1), D1)).toEqual([1, 2]);
  });

  test('toggle undoes a completion', () => {
    let p = done(ensureDay(fresh(D1), D1), [1]);
    expect(p.done[1]).toBe(D1);
    p = toggleDone(p, 1, D1);
    expect(p.done[1]).toBeUndefined();
  });

  test('end of plan: only the last episode is left', () => {
    let p = fresh(D1);
    p = done(p, EPISODES.map(e => e.n).filter(n => n !== 100));
    const day = addDays(D1, 60);
    expect(shown(ensureDay(p, day), day)).toEqual([100]);
  });
});

describe('stats', () => {
  test('activity counts completions per plan day', () => {
    let p = fresh(D1);
    p = done(p, [1, 2], D1);
    p = done(p, [3], addDays(D1, 2));
    const a = activity(p);
    expect(a).toHaveLength(50);
    expect(a.slice(0, 4)).toEqual([2, 0, 1, 0]);
  });

  test('streaks: current includes today or yesterday, best is the longest run', () => {
    let p = fresh(D1);
    p = done(p, [1], D1);
    p = done(p, [2], addDays(D1, 1));
    p = done(p, [3], addDays(D1, 2));
    p = done(p, [4], addDays(D1, 5));
    p = done(p, [5], addDays(D1, 6));
    expect(streaks(p, addDays(D1, 6))).toEqual({ current: 2, best: 3 });
    expect(streaks(p, addDays(D1, 7))).toEqual({ current: 2, best: 3 });
    expect(streaks(p, addDays(D1, 8))).toEqual({ current: 0, best: 3 });
  });

  test('ring progress is done / total per group', () => {
    const p = done(fresh(D1), [1, 2, 9]);
    const found = ringProgress(p)[0].rings[0];
    expect(found.total).toBe(6);
    expect(found.done).toBe(3);
    expect(found.frac).toBeCloseTo(0.5);
  });

  test('hours watched sums finished episode lengths', () => {
    const p = done(fresh(D1), [1]);
    expect(hoursWatched(p)).toBeCloseTo(EPISODES[0].secs / 3600);
  });
});

describe('hyper mode', () => {
  test('old saves without a mode are normal', () => {
    const { mode, ...old } = fresh(D1);
    expect(modeOf(old)).toBe('normal');
    expect(planDays(old)).toBe(50);
  });

  test('hyper is four a day over 25 days', () => {
    const p = ensureDay(fresh(D1, 'hyper'), D1);
    expect(p.days[D1].base).toEqual([1, 2, 3, 4]);
    expect(planDays(p)).toBe(25);
    expect(activity(p)).toHaveLength(25);
  });

  test('switching mid-day tops today up to four, skipping finished episodes', () => {
    let p = done(ensureDay(fresh(D1), D1), [1, 3]);
    p = goHyper(p, D1);
    expect(modeOf(p)).toBe('hyper');
    expect(p.days[D1].base).toEqual([1, 2, 4, 5]);
  });

  test('hyper is one-way and survives a reset', () => {
    const p = goHyper(ensureDay(fresh(D1), D1), D1);
    expect(goHyper(p, D1)).toBe(p);
    expect(modeOf(fresh(D1, modeOf(p)))).toBe('hyper');
  });
});
