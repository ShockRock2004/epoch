import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BONUS, EPISODES, TOTAL } from '../data/plan';
import { useStore, DEFAULT_START } from '../lib/store';
import { activity, addDays, diffDays, episodesOn, hoursWatched, ringProgress, streaks, totalHours, PLAN_DAYS } from '../lib/schedule';
import { C, FONT, GLASS, R, RING_COLORS, S, T, fmtClock } from '../theme';
import { Glass } from '../components/Glass';
import { Rings } from '../components/Rings';
import { ActivityChart } from '../components/ActivityChart';
import { useTabClearance } from '../components/TabBar';
import { IconCheck, IconChevron, IconGear, IconPlay } from '../components/Icons';
import { openSeg } from '../lib/youtube';
import { haptic } from '../lib/haptics';

const shortDate = (k: string) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};

export function Progress() {
  const { p, today, setStart, reset } = useStore();
  const insets = useSafeAreaInsets();
  const clearance = useTabClearance();
  const { width } = useWindowDimensions();
  const [sel, setSel] = useState<number | null>(null);
  const [settings, setSettings] = useState(false);
  const [armed, setArmed] = useState(false);

  const clusters = ringProgress(p);
  const counts = activity(p);
  const todayIdx = diffDays(p.start, today);
  const st = streaks(p, today);
  const done = Object.keys(p.done).length;
  const hrs = hoursWatched(p);
  const chartW = Math.min(width, 640) - S.lg * 2 - S.xl * 2;

  const selDay = sel != null ? addDays(p.start, sel) : null;
  const selEps = selDay ? episodesOn(p, selDay) : [];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + S.xl, paddingHorizontal: S.lg, paddingBottom: clearance, gap: S.md }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <Text style={T.heading}>Progress</Text>
          <Pressable onPress={() => { haptic.nav(); setArmed(false); setSettings(true); }} hitSlop={10} style={styles.iconBtn} accessibilityLabel="Settings">
            <IconGear size={18} color={C.ink2} />
          </Pressable>
        </View>

        <View style={styles.stats}>
          {[
            { v: `${done}`, l: `of ${TOTAL} episodes` },
            { v: hrs.toFixed(1), l: `of ${totalHours().toFixed(0)} hours` },
            { v: `${st.current}`, l: st.best > st.current ? `day streak, best ${st.best}` : 'day streak' },
          ].map(s => (
            <Glass key={s.l} style={styles.stat}>
              <Text style={styles.statV}>{s.v}</Text>
              <Text style={[T.meta, { marginTop: 2 }]}>{s.l}</Text>
            </Glass>
          ))}
        </View>

        {clusters.map((cl, ci) => (
          <Glass key={cl.title} style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={T.title}>{cl.title}</Text>
              <Text style={[T.secondary, styles.num]}>{Math.round(cl.frac * 100)}%</Text>
            </View>
            <View style={styles.ringRow}>
              <View>
                <Rings rings={cl.rings.map((r, i) => ({ frac: r.frac, color: RING_COLORS[ci][i] }))} size={136} stroke={10} gap={5} />
                <View style={styles.ringCenter} pointerEvents="none">
                  <Text style={styles.ringNum}>{cl.done}</Text>
                  <Text style={[T.meta, { fontSize: 11 }]}>of {cl.total}</Text>
                </View>
              </View>
              <View style={styles.legend}>
                {cl.rings.map((r, i) => (
                  <View key={r.key} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: RING_COLORS[ci][i] }]} />
                    <Text style={[T.secondary, { flex: 1 }]} numberOfLines={1}>{r.name}</Text>
                    <Text style={[T.meta, styles.num]}>{r.done}/{r.total}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Glass>
        ))}

        <Glass style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={T.title}>Activity</Text>
            <Text style={T.meta}>{todayIdx < 0 ? 'Not started' : todayIdx >= PLAN_DAYS ? 'Plan days over' : `Day ${todayIdx + 1} of ${PLAN_DAYS}`}</Text>
          </View>
          <ActivityChart counts={counts} todayIndex={todayIdx} selected={sel} onSelect={i => { haptic.select(); setSel(sel === i ? null : i); }} width={chartW} />
          <View style={styles.key}>
            <View style={[styles.keySw, { backgroundColor: C.accent }]} /><Text style={T.meta}>2+ episodes</Text>
            <View style={[styles.keySw, { backgroundColor: 'rgba(196,181,253,0.5)' }]} /><Text style={T.meta}>1</Text>
            <View style={styles.keyLine} /><Text style={T.meta}>daily target</Text>
          </View>
          {selDay && (
            <View style={styles.selBox}>
              <Text style={[T.secondary, { color: C.ink }]}>Day {sel! + 1} · {shortDate(selDay)}</Text>
              {selEps.length === 0 ? (
                <Text style={T.meta}>{sel! > todayIdx ? 'Still ahead.' : 'Nothing finished that day.'}</Text>
              ) : selEps.map(n => (
                <View key={n} style={styles.selRow}>
                  <IconCheck size={13} color={C.accent} strokeWidth={2.4} />
                  <Text style={[T.meta, { color: C.ink2, flex: 1 }]} numberOfLines={1}>Episode {n} · {EPISODES[n - 1].name}</Text>
                </View>
              ))}
            </View>
          )}
        </Glass>

        <Text style={[T.label, { marginTop: S.lg, marginLeft: S.xs }]}>IF YOU FINISH EARLY</Text>
        {BONUS.map(s => (
          <Pressable key={s.id} onPress={() => { haptic.nav(); openSeg(s); }} accessibilityRole="link">
            {({ pressed }) => (
              <Glass style={[styles.bonus, pressed && { transform: [{ scale: 0.985 }] }]}>
                <View style={styles.bonusPlay}><IconPlay size={11} color={C.ink2} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={[T.secondary, { color: C.ink }]} numberOfLines={2}>{s.title}</Text>
                  <Text style={[T.meta, { marginTop: 2 }]}>{s.channel} · {fmtClock(s.len)}</Text>
                </View>
              </Glass>
            )}
          </Pressable>
        ))}
      </ScrollView>

      <Modal visible={settings} transparent animationType="fade" onRequestClose={() => setSettings(false)} statusBarTranslucent navigationBarTranslucent>
        <Pressable style={styles.scrim} onPress={() => setSettings(false)} accessibilityLabel="Close" />
        <View style={[styles.sheetWrap, { paddingBottom: insets.bottom + S.lg }]} pointerEvents="box-none">
          <Glass variant="solid" radius={R.lg} border={GLASS.borderHi} style={styles.sheet}>
            <View style={styles.grab} />
            <Text style={T.title}>Settings</Text>
            <Text style={styles.sheetLabel}>DAY 1 IS</Text>
            <View style={styles.stepper}>
              <Pressable onPress={() => { haptic.select(); setStart(addDays(p.start, -1)); }} style={styles.stepBtn} accessibilityLabel="One day earlier">
                <IconChevron dir="left" size={17} color={C.ink2} />
              </Pressable>
              <Text style={[T.secondary, { color: C.ink, fontFamily: FONT[500] }]}>{shortDate(p.start)} {p.start.slice(0, 4)}</Text>
              <Pressable onPress={() => { haptic.select(); setStart(addDays(p.start, 1)); }} style={styles.stepBtn} accessibilityLabel="One day later">
                <IconChevron size={17} color={C.ink2} />
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', gap: S.sm, marginTop: S.sm }}>
              <Pressable onPress={() => { haptic.select(); setStart(today); }} style={styles.smallBtn}><Text style={styles.smallBtnText}>Start today</Text></Pressable>
              <Pressable onPress={() => { haptic.select(); setStart(DEFAULT_START); }} style={styles.smallBtn}><Text style={styles.smallBtnText}>7 Oct 2026</Text></Pressable>
            </View>
            <Text style={styles.sheetLabel}>RESET</Text>
            <Pressable
              onPress={() => {
                if (!armed) { haptic.warn(); setArmed(true); return; }
                haptic.undo(); reset(); setArmed(false); setSettings(false);
              }}
              style={[styles.reset, armed && styles.resetArmed]}
            >
              <Text style={styles.resetText}>{armed ? 'Tap again to erase all progress' : 'Reset progress'}</Text>
            </Pressable>
          </Glass>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: S.xs },
  iconBtn: { width: 38, height: 38, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: GLASS.border },
  stats: { flexDirection: 'row', gap: S.sm },
  stat: { flex: 1, paddingVertical: S.md + 2, paddingHorizontal: S.md },
  statV: { fontFamily: FONT[600], fontSize: 22, color: C.ink, fontVariant: ['tabular-nums'] },
  card: { padding: S.xl },
  cardHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: S.lg },
  num: { fontVariant: ['tabular-nums'] },
  ringRow: { flexDirection: 'row', alignItems: 'center', gap: S.xl },
  ringCenter: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  ringNum: { fontFamily: FONT[600], fontSize: 20, color: C.ink, fontVariant: ['tabular-nums'] },
  legend: { flex: 1, gap: S.md },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  key: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: S.md },
  keySw: { width: 8, height: 8, borderRadius: 2, marginLeft: 4 },
  keyLine: { width: 14, borderTopWidth: 1, borderStyle: 'dashed', borderColor: GLASS.borderHi, marginLeft: 8 },
  selBox: { marginTop: S.md, padding: S.md, borderRadius: R.md, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: GLASS.border, gap: 6 },
  selRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bonus: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md + 2, borderRadius: R.card - 2 },
  bonusPlay: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: GLASS.border, paddingLeft: 2 },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(8,6,20,0.72)' },
  sheetWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: S.md },
  sheet: { padding: S.xl, paddingTop: S.md },
  grab: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: GLASS.borderHi, marginBottom: S.lg },
  sheetLabel: { ...T.label, marginTop: S.xl, marginBottom: S.sm },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: R.md, borderWidth: 1, borderColor: GLASS.border, padding: 3 },
  stepBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: R.sm },
  smallBtn: { paddingHorizontal: S.md, height: 32, borderRadius: R.pill, borderWidth: 1, borderColor: GLASS.border, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center' },
  smallBtnText: { color: C.ink2, fontFamily: FONT[500], fontSize: 13 },
  reset: { height: 44, borderRadius: R.sm + 2, borderWidth: 1, borderColor: GLASS.borderHi, alignItems: 'center', justifyContent: 'center' },
  resetArmed: { borderColor: '#8A4B52', backgroundColor: 'rgba(138,75,82,0.16)' },
  resetText: { color: '#E3A7AE', fontFamily: FONT[500], fontSize: 14 },
});
