import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeInLeft, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EPISODES, TOTAL } from '../data/plan';
import { useStore } from '../lib/store';
import { dayNumber, PLAN_DAYS } from '../lib/schedule';
import { C, FONT, R, S, T } from '../theme';
import { EpisodeCard } from '../components/EpisodeCard';
import { Surface } from '../components/Surface';
import { IconChevron } from '../components/Icons';
import { TopicArt, TOPIC_LABEL } from '../components/illustrations';
import { useTabClearance } from '../components/TabBar';
import { haptic } from '../lib/haptics';

/** "2026-10-07" → { date: "7 OCTOBER", weekday: "Wednesday" } */
const dateParts = (k: string) => {
  const [y, m, d] = k.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return {
    date: `${d} ${dt.toLocaleDateString('en-GB', { month: 'long' }).toUpperCase()}`,
    weekday: dt.toLocaleDateString('en-GB', { weekday: 'long' }),
  };
};

const ART = 132;

export function Home() {
  const { p, today, toggle } = useStore();
  const insets = useSafeAreaInsets();
  const clearance = useTabClearance();
  const [offset, setOffset] = useState(0); // pages of two episodes away from today
  const [dir, setDir] = useState<1 | -1>(1);

  // Today's pair is frozen for the day (carry-over included); the arrows page through the plan from there.
  const base = p.days[today]?.base ?? [];
  const anchor = base[0] ?? TOTAL;
  const start = Math.min(Math.max(anchor + 2 * offset, 1), TOTAL);
  const nums = offset === 0 && base.length ? base : [start, start + 1].filter(n => n <= TOTAL);
  const eps = nums.map(n => EPISODES[n - 1]);
  const canPrev = nums[0] > 1;
  const canNext = nums[nums.length - 1] < TOTAL;

  const focus = eps.find(e => !p.done[e.n]) ?? eps[0];
  const topic = focus?.topic ?? 'review';
  const day = dayNumber(p.start, today);
  const allDone = Object.keys(p.done).length >= TOTAL;
  const todayDone = offset === 0 && base.length > 0 && base.every(n => p.done[n]);
  const { date, weekday } = dateParts(today);

  const dayLabel = offset !== 0
    ? offset > 0 ? 'Up next' : 'Earlier'
    : day < 1 ? `Starts in ${-day} day${day === -1 ? '' : 's'}` : `Day ${day}${day > PLAN_DAYS ? ' · Overtime' : ''}`;

  const go = (d: 1 | -1) => {
    if ((d > 0 && !canNext) || (d < 0 && !canPrev)) return;
    haptic.select();
    setDir(d);
    setOffset(o => o + d);
  };

  useEffect(() => { setOffset(0); }, [today]);

  const enter = (dir > 0 ? FadeInRight : FadeInLeft).duration(260).easing(Easing.out(Easing.quad));

  return (
    <ScrollView contentContainerStyle={{ paddingTop: insets.top + S.xxxl, paddingBottom: clearance }} showsVerticalScrollIndicator={false}>
      {/* 1 · Date */}
      <View style={styles.header}>
        <Text style={T.display} accessibilityRole="header">{date}</Text>
        <Text style={styles.weekday}>{weekday}</Text>
      </View>

      {/* 2 · Topic, with paging arrows */}
      <View style={styles.heroRow}>
        <NavButton dir="left" enabled={canPrev} onPress={() => go(-1)} />
        <Animated.View key={topic} entering={FadeIn.duration(240)}>
          <TopicArt topic={topic} size={ART} />
        </Animated.View>
        <NavButton dir="right" enabled={canNext} onPress={() => go(1)} />
      </View>
      <View style={styles.studyRow}>
        <Text style={styles.studyDay}>{dayLabel}</Text>
        <Text style={styles.studySep}>·</Text>
        <Text style={styles.studyTopic}>{TOPIC_LABEL[topic]}</Text>
      </View>

      {/* 3–5 · Episodes */}
      <View style={styles.section}>
        <Text style={T.meta}>
          {nums.length > 1 ? `Episodes ${nums[0]}–${nums[nums.length - 1]}` : `Episode ${nums[0]}`}
          <Text style={{ color: C.faint }}> of {TOTAL}</Text>
        </Text>
        {offset !== 0 && (
          <Pressable onPress={() => { haptic.nav(); setDir(offset > 0 ? -1 : 1); setOffset(0); }} style={styles.todayChip} hitSlop={8} accessibilityRole="button">
            <Text style={styles.todayChipText}>Back to today</Text>
          </Pressable>
        )}
      </View>

      <Animated.View key={nums.join('-')} entering={enter} style={styles.cards}>
        {eps.map(ep => (
          <EpisodeCard key={ep.n} ep={ep} done={!!p.done[ep.n]} onToggle={toggle} />
        ))}
      </Animated.View>

      {(todayDone || allDone) && (
        <Animated.View entering={FadeIn.duration(240)} style={styles.cards}>
          <Surface tone="base" style={styles.note}>
            <Text style={[T.secondary, { color: C.ink }]}>{allDone ? 'Plan complete. All 100 episodes.' : "That's today done."}</Text>
            <Text style={[T.meta, { marginTop: 2 }]}>
              {allDone ? 'Do the mock interviews out loud with a friend.' : 'Use → to keep going, or move on to your other targets.'}
            </Text>
          </Surface>
        </Animated.View>
      )}
    </ScrollView>
  );
}

function NavButton({ dir, enabled, onPress }: { dir: 'left' | 'right'; enabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!enabled}
      hitSlop={12}
      style={({ pressed }) => [styles.navBtn, !enabled && { opacity: 0.35 }, pressed && { backgroundColor: C.hover }]}
      accessibilityRole="button"
      accessibilityLabel={dir === 'left' ? 'Previous episodes' : 'Next episodes'}
    >
      <IconChevron dir={dir} size={18} color={C.ink2} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center' },
  weekday: { fontFamily: FONT[400], fontSize: 15, color: C.muted, marginTop: S.xs },
  heroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.xxl, marginTop: S.xxxl },
  navBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  studyRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'baseline', gap: S.sm, marginTop: S.lg },
  studyDay: { fontFamily: FONT[600], fontSize: 15, color: C.ink },
  studySep: { fontFamily: FONT[400], fontSize: 15, color: C.faint },
  studyTopic: { fontFamily: FONT[400], fontSize: 15, color: C.ink2 },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: S.xl, marginTop: S.xxxl, marginBottom: S.md, minHeight: 28 },
  todayChip: { paddingHorizontal: S.md, height: 28, borderRadius: R.pill, justifyContent: 'center', backgroundColor: C.card, borderWidth: 1, borderColor: C.border2 },
  todayChipText: { fontFamily: FONT[500], fontSize: 12, color: C.accent },
  cards: { paddingHorizontal: S.lg, gap: S.md },
  note: { padding: S.lg, marginTop: S.md },
});
