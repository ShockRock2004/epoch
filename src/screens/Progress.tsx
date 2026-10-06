import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BONUS, EPISODES, TOTAL } from '../data/plan';
import { useStore, DEFAULT_START } from '../lib/store';
import { activity, addDays, diffDays, episodesOn, hoursWatched, ringProgress, streaks, totalHours, PLAN_DAYS } from '../lib/schedule';
import { C, R, RING_COLORS, fmtClock, FONT } from '../theme';
import { GlassView } from '../components/GlassView';
import { Rings } from '../components/Rings';
import { ActivityChart } from '../components/ActivityChart';
import { IconChevron, IconFlame, IconGear, IconPlay } from '../components/Icons';
import { openSeg } from '../lib/youtube';
import { haptic } from '../lib/haptics';

const shortDate = (k: string) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};

export function Progress({ bottomPad }: { bottomPad: number }) {
  const { p, today, setStart, reset } = useStore();
  const insets = useSafeAreaInsets();
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
  const chartW = width - 32 - 32;

  const selDay = sel != null ? addDays(p.start, sel) : null;
  const selEps = selDay ? episodesOn(p, selDay) : [];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 14, paddingHorizontal: 16, paddingBottom: bottomPad + 16, gap: 14 }} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Progress</Text>
          <Pressable onPress={() => { haptic.nav(); setArmed(false); setSettings(true); }} hitSlop={10} accessibilityLabel="Settings">
            <GlassView radius={R.md} style={styles.gear}><IconGear size={19} color={C.ink2} /></GlassView>
          </Pressable>
        </View>

        {clusters.map((cl, ci) => (
          <GlassView key={cl.title} radius={R.xl} style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>{cl.title}</Text>
              <Text style={styles.cardPct}>{Math.round(cl.frac * 100)}%</Text>
            </View>
            <View style={styles.ringRow}>
              <View>
                <Rings rings={cl.rings.map((r, i) => ({ frac: r.frac, color: RING_COLORS[ci][i] }))} />
                <View style={styles.ringCenter} pointerEvents="none">
                  <Text style={styles.ringNum}>{cl.done}</Text>
                  <Text style={styles.ringOf}>of {cl.total}</Text>
                </View>
              </View>
              <View style={styles.legend}>
                {cl.rings.map((r, i) => (
                  <View key={r.key} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: RING_COLORS[ci][i] }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.legendName} numberOfLines={1}>{r.name}</Text>
                      <Text style={[styles.legendVal, { color: RING_COLORS[ci][i] }]}>{r.done}/{r.total}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </GlassView>
        ))}

        <View style={styles.stats}>
          {[
            { v: `${done}`, l: `of ${TOTAL} done` },
            { v: hrs.toFixed(1), l: `of ${totalHours().toFixed(0)} hrs` },
            { v: `${st.current}`, l: 'day streak', flame: st.current > 0 },
            { v: `${st.best}`, l: 'best streak' },
          ].map(s => (
            <GlassView key={s.l} radius={R.lg} style={styles.stat}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.statV}>{s.v}</Text>
                {s.flame && <IconFlame size={15} color={C.warn} />}
              </View>
              <Text style={styles.statL}>{s.l}</Text>
            </GlassView>
          ))}
        </View>

        <GlassView radius={R.xl} style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>50-day activity</Text>
            <Text style={styles.legendName}>
              {todayIdx < 0 ? 'Not started' : todayIdx >= PLAN_DAYS ? 'Plan days over' : `Day ${todayIdx + 1}`}
            </Text>
          </View>
          <ActivityChart counts={counts} todayIndex={todayIdx} selected={sel} onSelect={i => { haptic.select(); setSel(sel === i ? null : i); }} width={chartW} />
          <View style={styles.key}>
            <View style={[styles.keySw, { backgroundColor: C.good }]} /><Text style={styles.keyText}>2+ episodes</Text>
            <View style={[styles.keySw, { backgroundColor: '#5C7FB0' }]} /><Text style={styles.keyText}>1</Text>
            <View style={[styles.keyLine]} /><Text style={styles.keyText}>daily target</Text>
          </View>
          {selDay && (
            <View style={styles.selBox}>
              <Text style={styles.selTitle}>Day {sel! + 1} · {shortDate(selDay)}</Text>
              {selEps.length === 0 ? (
                <Text style={styles.selEmpty}>{sel! > todayIdx ? 'Still ahead.' : 'Nothing finished that day.'}</Text>
              ) : selEps.map(n => (
                <Text key={n} style={styles.selEp} numberOfLines={1}>
                  <Text style={{ color: C.good }}>✓ </Text>Ep {n} · {EPISODES[n - 1].name}
                </Text>
              ))}
            </View>
          )}
        </GlassView>

        <Text style={styles.section}>If you finish early</Text>
        {BONUS.map(s => (
          <Pressable key={s.id} onPress={() => { haptic.nav(); openSeg(s); }} accessibilityRole="link">
            <GlassView radius={R.lg} style={styles.bonus}>
              <View style={styles.bonusPlay}><IconPlay size={12} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bonusTitle} numberOfLines={2}>{s.title}</Text>
                <Text style={styles.legendName}>{s.channel} · {fmtClock(s.len)}</Text>
              </View>
            </GlassView>
          </Pressable>
        ))}
      </ScrollView>

      <Modal visible={settings} transparent animationType="fade" onRequestClose={() => setSettings(false)} statusBarTranslucent navigationBarTranslucent>
        <Pressable style={styles.scrim} onPress={() => setSettings(false)} accessibilityLabel="Close" />
        <View style={[styles.sheetWrap, { paddingBottom: insets.bottom + 16 }]} pointerEvents="box-none">
          <GlassView radius={R.xl + 4} style={styles.sheet}>
            <View style={styles.grab} />
            <Text style={styles.sheetTitle}>Settings</Text>
            <Text style={styles.sheetLabel}>Day 1 is</Text>
            <View style={styles.stepper}>
              <Pressable onPress={() => { haptic.select(); setStart(addDays(p.start, -1)); }} style={styles.stepBtn} accessibilityLabel="One day earlier">
                <IconChevron dir="left" size={18} color={C.ink} />
              </Pressable>
              <Text style={styles.stepVal}>{shortDate(p.start)} {p.start.slice(0, 4)}</Text>
              <Pressable onPress={() => { haptic.select(); setStart(addDays(p.start, 1)); }} style={styles.stepBtn} accessibilityLabel="One day later">
                <IconChevron size={18} color={C.ink} />
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <Pressable onPress={() => { haptic.select(); setStart(today); }} style={styles.smallBtn}><Text style={styles.smallBtnText}>Start today</Text></Pressable>
              <Pressable onPress={() => { haptic.select(); setStart(DEFAULT_START); }} style={styles.smallBtn}><Text style={styles.smallBtnText}>7 Oct 2026</Text></Pressable>
            </View>
            <Text style={styles.sheetLabel}>Danger zone</Text>
            <Pressable
              onPress={() => {
                if (!armed) { haptic.warn(); setArmed(true); return; }
                haptic.undo(); reset(); setArmed(false); setSettings(false);
              }}
              style={[styles.reset, armed && styles.resetArmed]}
            >
              <Text style={styles.resetText}>{armed ? 'Tap again to erase all progress' : 'Reset progress'}</Text>
            </Pressable>
          </GlassView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: C.ink, fontSize: 28, fontFamily: FONT[800], letterSpacing: -0.5 },
  gear: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  card: { padding: 16 },
  cardHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 },
  cardTitle: { color: C.ink, fontSize: 17, fontFamily: FONT[700] },
  cardPct: { color: C.ink2, fontSize: 15, fontFamily: FONT[700], fontVariant: ['tabular-nums'] },
  ringRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ringCenter: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  ringNum: { color: C.ink, fontSize: 20, fontFamily: FONT[800], fontVariant: ['tabular-nums'] },
  ringOf: { color: C.muted, fontFamily: FONT[400], fontSize: 10.5 },
  legend: { flex: 1, gap: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendName: { color: C.muted, fontFamily: FONT[400], fontSize: 12.5 },
  legendVal: { fontSize: 14, fontFamily: FONT[800], fontVariant: ['tabular-nums'] },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, paddingVertical: 12, paddingHorizontal: 10 },
  statV: { color: C.ink, fontSize: 20, fontFamily: FONT[800], fontVariant: ['tabular-nums'] },
  statL: { color: C.muted, fontFamily: FONT[400], fontSize: 11.5, marginTop: 2 },
  key: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  keySw: { width: 9, height: 9, borderRadius: 2 },
  keyLine: { width: 14, height: 0, borderTopWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(200,222,255,0.8)', marginLeft: 6 },
  keyText: { color: C.muted, fontFamily: FONT[400], fontSize: 11.5, marginRight: 6 },
  selBox: { marginTop: 12, padding: 12, borderRadius: R.md, backgroundColor: 'rgba(255,255,255,0.05)', gap: 4 },
  selTitle: { color: C.ink, fontSize: 13.5, fontFamily: FONT[700] },
  selEmpty: { color: C.muted, fontFamily: FONT[400], fontSize: 13 },
  selEp: { color: C.ink2, fontFamily: FONT[400], fontSize: 13 },
  section: { color: C.ink, fontSize: 17, fontFamily: FONT[700], marginTop: 6 },
  bonus: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  bonusPlay: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.accent2, alignItems: 'center', justifyContent: 'center', paddingLeft: 2 },
  bonusTitle: { color: C.ink, fontSize: 14, fontFamily: FONT[600], lineHeight: 19 },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(4,6,14,0.7)' },
  sheetWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 12 },
  sheet: { padding: 18, paddingTop: 10 },
  grab: { alignSelf: 'center', width: 38, height: 4, borderRadius: 2, backgroundColor: C.line2, marginBottom: 12 },
  sheetTitle: { color: C.ink, fontSize: 20, fontFamily: FONT[800] },
  sheetLabel: { color: C.muted, fontSize: 12.5, fontFamily: FONT[700], marginTop: 18, marginBottom: 8, letterSpacing: 0.4, textTransform: 'uppercase' },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: R.md, padding: 4 },
  stepBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: R.sm },
  stepVal: { color: C.ink, fontSize: 16, fontFamily: FONT[700] },
  smallBtn: { paddingHorizontal: 14, height: 36, borderRadius: R.pill, borderWidth: 1, borderColor: C.line2, justifyContent: 'center' },
  smallBtnText: { color: C.ink2, fontFamily: FONT[600], fontSize: 13.5 },
  reset: { height: 48, borderRadius: R.md, borderWidth: 1, borderColor: 'rgba(255,92,122,0.5)', alignItems: 'center', justifyContent: 'center' },
  resetArmed: { backgroundColor: 'rgba(255,92,122,0.22)' },
  resetText: { color: '#FF8FA6', fontFamily: FONT[700], fontSize: 15 },
});
