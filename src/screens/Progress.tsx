import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BONUS, EPISODES, TOTAL } from '../data/plan';
import { useStore, DEFAULT_START } from '../lib/store';
import { activity, addDays, diffDays, episodesOn, hoursWatched, ringProgress, streaks, totalHours, PLAN_DAYS } from '../lib/schedule';
import { C, FONT, GLASS, GRAD, R, RING_COLORS, S, T, fmtClock } from '../theme';
import { Glass } from '../components/Glass';
import { Rings } from '../components/Rings';
import { ActivityChart } from '../components/ActivityChart';
import { BlackButton } from '../components/Buttons';
import { useTabClearance } from '../components/TabBar';
import { Sheet } from '../components/Overlay';
import { useBackdropScroll } from '../components/Backdrop';
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
  const onScroll = useBackdropScroll();

  const clusters = ringProgress(p);
  const counts = activity(p);
  const todayIdx = diffDays(p.start, today);
  const st = streaks(p, today);
  const done = Object.keys(p.done).length;
  const hrs = hoursWatched(p);
  const chartW = Math.min(width, 640) - S.lg * 2 - S.xl * 2;
  const dayCaption = todayIdx < 0 ? 'NOT STARTED YET' : todayIdx >= PLAN_DAYS ? 'PLAN DAYS OVER' : `DAY ${todayIdx + 1} OF ${PLAN_DAYS}`;

  const selDay = sel != null ? addDays(p.start, sel) : null;
  const selEps = selDay ? episodesOn(p, selDay) : [];

  return (
    <View style={{ flex: 1 }}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: insets.top + S.xl, paddingHorizontal: S.lg, paddingBottom: clearance, gap: S.md }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.screenTitle}>PROGRESS</Text>
            <Text style={[T.label, { color: C.muted }]}>{dayCaption}</Text>
          </View>
          <Pressable onPress={() => { haptic.nav(); setArmed(false); setSettings(true); }} hitSlop={10} style={styles.iconBtn} accessibilityLabel="Settings">
            <IconGear size={18} color={C.ink} />
          </Pressable>
        </View>

        {/* Apple-Watch-style rings, one stack per half of the plan */}
        {clusters.map((cl, ci) => (
          <Glass key={cl.title} style={styles.card}>
            <View style={styles.clusterHead}>
              <Text style={styles.clusterTitle}>{cl.title.toUpperCase()}</Text>
              <Text style={[T.meta, styles.num]}>{Math.round(cl.frac * 100)}%</Text>
            </View>
            <View style={[styles.rule, { marginBottom: S.lg }]} />
            <View style={styles.ringRow}>
              <View>
                <Rings rings={cl.rings.map((r, i) => ({ frac: r.frac, color: RING_COLORS[ci][i] }))} size={150} stroke={13} gap={4} />
                <View style={styles.ringCenter} pointerEvents="none">
                  <Text style={styles.ringNum}>{cl.done}</Text>
                  <Text style={[T.meta, { fontSize: 11 }]}>of {cl.total}</Text>
                </View>
              </View>
              <View style={styles.legend}>
                {cl.rings.map((r, i) => (
                  <View key={r.key} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: RING_COLORS[ci][i] }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={T.label}>{r.name.toUpperCase()}</Text>
                      <Text style={[styles.legendVal, { color: RING_COLORS[ci][i] }]}>{r.done}<Text style={styles.legendOf}>/{r.total}</Text></Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </Glass>
        ))}

        {/* Split card: hours | streak */}
        <Glass>
          <View style={styles.splitRow}>
            <View style={styles.splitCell}>
              <Text style={T.label}>EPISODES</Text>
              <Text style={styles.big}>{done}<Text style={styles.bigUnit}> / {TOTAL}</Text></Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.splitCell}>
              <Text style={T.label}>HOURS</Text>
              <Text style={styles.big}>{hrs.toFixed(1)}<Text style={styles.bigUnit}> / {totalHours().toFixed(0)}</Text></Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.splitCell}>
              <Text style={T.label}>STREAK</Text>
              <Text style={[styles.big, { color: C.accent }]}>{st.current}<Text style={styles.bigUnit}> best {st.best}</Text></Text>
            </View>
          </View>
        </Glass>

        <Glass style={styles.card}>
          <View style={styles.clusterHead}>
            <Text style={styles.clusterTitle}>ACTIVITY</Text>
            <Text style={T.meta}>50 days</Text>
          </View>
          <View style={[styles.rule, { marginBottom: S.md }]} />
          <ActivityChart counts={counts} todayIndex={todayIdx} selected={sel} onSelect={i => { haptic.select(); setSel(sel === i ? null : i); }} width={chartW} />
          <View style={styles.key}>
            <LinearGradient colors={GRAD} style={styles.keySw} /><Text style={T.meta}>2+ episodes</Text>
            <View style={[styles.keySw, { backgroundColor: 'rgba(199,125,255,0.45)' }]} /><Text style={T.meta}>1</Text>
            <View style={styles.keyLine} /><Text style={T.meta}>target</Text>
          </View>
          {selDay && (
            <View style={styles.selBox}>
              <Text style={[T.secondary, { color: C.ink, fontFamily: FONT[700] }]}>Day {sel! + 1} · {shortDate(selDay)}</Text>
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
              <Glass style={pressed ? { transform: [{ scale: 0.985 }] } : undefined}>
                <View style={styles.bonusRow}>
                  <LinearGradient colors={GRAD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bonusPlay}><IconPlay size={11} color={C.ink} /></LinearGradient>
                  <View style={{ flex: 1 }}>
                    <Text style={[T.secondary, { color: C.ink, fontFamily: FONT[600] }]} numberOfLines={2}>{s.title}</Text>
                    <Text style={[T.meta, { marginTop: 2 }]}>{s.channel} · {fmtClock(s.len)}</Text>
                  </View>
                </View>
              </Glass>
            )}
          </Pressable>
        ))}
      </Animated.ScrollView>

      <Sheet visible={settings} onClose={() => setSettings(false)} style={styles.sheet}>
        <View style={styles.grab} />
        <Text style={styles.clusterTitle}>SETTINGS</Text>
        <Text style={styles.sheetLabel}>DAY 1 IS</Text>
        <View style={styles.stepper}>
          <Pressable onPress={() => { haptic.select(); setStart(addDays(p.start, -1)); }} style={styles.stepBtn} accessibilityLabel="One day earlier">
            <IconChevron dir="left" size={17} color={C.ink} />
          </Pressable>
          <Text style={[T.secondary, { color: C.ink, fontFamily: FONT[700] }]}>{shortDate(p.start)} {p.start.slice(0, 4)}</Text>
          <Pressable onPress={() => { haptic.select(); setStart(addDays(p.start, 1)); }} style={styles.stepBtn} accessibilityLabel="One day later">
            <IconChevron size={17} color={C.ink} />
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', gap: S.sm, marginTop: S.sm }}>
          <Pressable onPress={() => { haptic.select(); setStart(today); }} style={styles.smallBtn}><Text style={styles.smallBtnText}>Start today</Text></Pressable>
          <Pressable onPress={() => { haptic.select(); setStart(DEFAULT_START); }} style={styles.smallBtn}><Text style={styles.smallBtnText}>7 Oct 2026</Text></Pressable>
        </View>
        <Text style={styles.sheetLabel}>RESET</Text>
        <BlackButton
          label={armed ? 'Tap again to erase everything' : 'Reset progress'}
          height={46}
          onPress={() => {
            if (!armed) { haptic.warn(); setArmed(true); return; }
            haptic.undo(); reset(); setArmed(false); setSettings(false);
          }}
        />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: S.xs },
  screenTitle: { fontFamily: FONT[800], fontSize: 22, letterSpacing: 1.2, color: C.ink },
  iconBtn: { width: 44, height: 44, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', backgroundColor: GLASS.field, borderWidth: 1, borderColor: GLASS.borderHi },
  splitRow: { flexDirection: 'row', paddingVertical: S.lg },
  splitCell: { flex: 1, alignItems: 'center', gap: 4 },
  divider: { width: 1, backgroundColor: GLASS.borderHi },
  big: { fontFamily: FONT[600], fontSize: 22, color: C.ink, fontVariant: ['tabular-nums'] },
  bigUnit: { fontFamily: FONT[500], fontSize: 11, color: C.muted },
  ringRow: { flexDirection: 'row', alignItems: 'center', gap: S.xl },
  ringCenter: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  ringNum: { fontFamily: FONT[700], fontSize: 22, color: C.ink, fontVariant: ['tabular-nums'] },
  legend: { flex: 1, gap: S.md },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendVal: { fontFamily: FONT[700], fontSize: 15, fontVariant: ['tabular-nums'], marginTop: 1 },
  legendOf: { fontFamily: FONT[500], fontSize: 11, color: C.muted },
  card: { padding: S.xl },
  clusterHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  clusterTitle: { fontFamily: FONT[800], fontSize: 12, letterSpacing: 1.6, color: C.ink },
  rule: { height: 1, backgroundColor: GLASS.borderHi, marginTop: S.sm },
  num: { fontVariant: ['tabular-nums'] },
  key: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: S.md },
  keySw: { width: 9, height: 9, borderRadius: 2, marginLeft: 4 },
  keyLine: { width: 14, borderTopWidth: 1, borderStyle: 'dashed', borderColor: C.accentLine, marginLeft: 8 },
  selBox: { marginTop: S.md, padding: S.md, borderRadius: R.md, backgroundColor: GLASS.field, borderWidth: 1, borderColor: GLASS.border, gap: 6 },
  selRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bonusRow: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md + 2 },
  bonusPlay: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', paddingLeft: 2 },
  sheet: { padding: S.xl, paddingTop: S.md },
  grab: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: GLASS.borderHi, marginBottom: S.lg },
  sheetLabel: { ...T.label, marginTop: S.xl, marginBottom: S.sm },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: GLASS.field, borderRadius: R.md, borderWidth: 1, borderColor: GLASS.borderHi, padding: 3 },
  stepBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: R.sm },
  smallBtn: { paddingHorizontal: S.md, minHeight: 40, borderRadius: R.sm, borderWidth: 1, borderColor: GLASS.borderHi, backgroundColor: GLASS.field, justifyContent: 'center' },
  smallBtnText: { color: C.ink2, fontFamily: FONT[600], fontSize: 12.5 },
});
