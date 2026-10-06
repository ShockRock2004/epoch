import { EPISODES, TOTAL, RING_CLUSTERS, ringMembers } from '../src/data/plan';
import {
  Progress, fresh, ensureDay, todayView, reveal, toggleDone, dayNumber, addDays,
  activity, streaks, ringProgress, hoursWatched,
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
  test('first day shows episodes 1 and 2', () => {
    const p = ensureDay(fresh(D1), D1);
    expect(todayView(p, D1).shown).toEqual([1, 2]);
  });

  test('carry-over: finishing only ep 1 shows 2 and 3 tomorrow', () => {
    let p = ensureDay(fresh(D1), D1);
    p = done(p, [1]);
    const d2 = addDays(D1, 1);
    p = ensureDay(p, d2);
    expect(todayView(p, d2).shown).toEqual([2, 3]);
  });

  test('base is frozen for the day, so finished cards stay put', () => {
    let p = ensureDay(fresh(D1), D1);
    p = done(p, [1]);
    p = ensureDay(p, D1);
    expect(todayView(p, D1).shown).toEqual([1, 2]);
  });

  test('reveal appears only when all shown are done, and at most twice', () => {
    let p = ensureDay(fresh(D1), D1);
    expect(todayView(p, D1).canReveal).toBe(false);
    p = done(p, [1, 2]);
    expect(todayView(p, D1).canReveal).toBe(true);
    p = reveal(p, D1);
    expect(todayView(p, D1).shown).toEqual([1, 2, 3]);
    expect(todayView(p, D1).canReveal).toBe(false);
    p = done(p, [3]);
    expect(todayView(p, D1).canReveal).toBe(true);
    p = reveal(p, D1);
    p = done(p, [4]);
    const v = todayView(p, D1);
    expect(v.shown).toEqual([1, 2, 3, 4]);
    expect(v.canReveal).toBe(false);
    expect(v.allDoneForToday).toBe(true);
  });

  test('reveal is a no-op when not allowed', () => {
    const p = ensureDay(fresh(D1), D1);
    expect(reveal(p, D1)).toBe(p);
  });

  test('reveal skips episodes already finished out of order', () => {
    let p = ensureDay(fresh(D1), D1);
    p = done(p, [1, 2, 3]);
    p = reveal(p, D1);
    expect(todayView(p, D1).shown).toEqual([1, 2, 4]);
  });

  test('toggle undoes a completion', () => {
    let p = done(ensureDay(fresh(D1), D1), [1]);
    expect(p.done[1]).toBe(D1);
    p = toggleDone(p, 1, D1);
    expect(p.done[1]).toBeUndefined();
  });

  test('end of plan: nothing left → finished', () => {
    let p = fresh(D1);
    p = done(p, EPISODES.map(e => e.n).filter(n => n !== 100));
    const day = addDays(D1, 60);
    p = ensureDay(p, day);
    expect(todayView(p, day).shown).toEqual([100]);
    p = done(p, [100], day);
    const v = todayView(p, day);
    expect(v.finishedPlan).toBe(true);
    expect(v.canReveal).toBe(false);
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
