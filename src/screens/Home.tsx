import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing, FadeIn, useAnimatedStyle, useSharedValue, withRepeat, withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EPISODES, TOTAL } from '../data/plan';
import { useStore } from '../lib/store';
import { dayNumber, PLAN_DAYS } from '../lib/schedule';
import { C, FONT, GLASS, R, S, T } from '../theme';
import { EpisodeCard } from '../components/EpisodeCard';
import { EpisodeSheet } from '../components/EpisodeSheet';
import { useBackdropScroll } from '../components/Backdrop';
import { slideX } from '../components/Overlay';
import { Glass } from '../components/Glass';
import { IconChevron } from '../components/Icons';
import { TopicArt, TOPIC_LABEL } from '../components/illustrations';
import { useTabClearance } from '../components/TabBar';
import { haptic } from '../lib/haptics';

/** "2026-10-07" → { date: "7 October", weekday: "Wednesday" } */
const dateParts = (k: string) => {
  const [y, m, d] = k.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return {
    date: `${d} ${dt.toLocaleDateString('en-GB', { month: 'long' })}`,
    weekday: dt.toLocaleDateString('en-GB', { weekday: 'long' }),
  };
};

const HERO = 200;

export function Home() {
  const { p, today, toggle } = useStore();
  const insets = useSafeAreaInsets();
  const clearance = useTabClearance();
  const [offset, setOffset] = useState(0); // pages of two episodes away from today
  const [dir, setDir] = useState<1 | -1>(1);
  const [open, setOpen] = useState<number | null>(null); // index into the pair on screen
  const onScroll = useBackdropScroll();

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

  // The icon drifts a few pixels over several seconds: alive, never busy.
  const drift = useSharedValue(0);
  useEffect(() => {
    drift.value = withRepeat(withTiming(1, { duration: 5200, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [drift]);
  const driftStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -5 * drift.value }] }));

  // Slide only: fading a glass card's parent makes Android re-layer and flash the blur.
  const enter = slideX(dir > 0 ? 28 : -28);

  return (
    <>
    <Animated.ScrollView onScroll={onScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingTop: insets.top + S.xl, paddingBottom: clearance }} showsVerticalScrollIndicator={false}>
      {/* Day and date: small, at the top, so the topic icon carries the screen */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{dayLabel} · {TOPIC_LABEL[topic]}</Text>
        <Text style={styles.date} accessibilityRole="header">{weekday}, {date}</Text>
      </View>

      {/* Topic icon, with paging arrows */}
      <View style={styles.heroRow}>
        <NavButton dir="left" enabled={canPrev} onPress={() => go(-1)} />
        <Animated.View style={driftStyle}>
          <Animated.View key={topic} entering={FadeIn.duration(320)}>
            <TopicArt topic={topic} size={HERO} />
          </Animated.View>
        </Animated.View>
        <NavButton dir="right" enabled={canNext} onPress={() => go(1)} />
      </View>

      {/* Episodes */}
      <View style={styles.section}>
        <Text style={T.label}>
          {nums.length > 1 ? `EPISODES ${nums[0]}–${nums[nums.length - 1]}` : `EPISODE ${nums[0]}`}
          <Text style={{ color: C.faint }}>  /  {TOTAL}</Text>
        </Text>
        {offset !== 0 && (
          <Pressable onPress={() => { haptic.nav(); setDir(offset > 0 ? -1 : 1); setOffset(0); }} hitSlop={10} accessibilityRole="button" style={styles.todayChip}>
            <Text style={styles.todayChipText}>BACK TO TODAY</Text>
          </Pressable>
        )}
      </View>

      <Animated.View key={nums.join('-')} entering={enter} style={styles.cards}>
        {eps.map((ep, i) => (
          <EpisodeCard key={ep.n} ep={ep} done={!!p.done[ep.n]} onToggle={toggle} onOpen={() => setOpen(i)} />
        ))}
      </Animated.View>

      {(todayDone || allDone) && (
        <Animated.View entering={slideX(0)} style={[styles.cards, { marginTop: S.md }]}>
          <Glass style={styles.note}>
            <Text style={T.label}>{allDone ? 'PLAN COMPLETE' : 'TODAY'}</Text>
            <Text style={[T.title, { marginTop: 4 }]}>{allDone ? 'All 100 episodes done.' : "That's today done."}</Text>
            <Text style={[T.meta, { marginTop: 2 }]}>
              {allDone ? 'Do the mock interviews out loud with a friend.' : 'Use → to keep going, or move on to your other targets.'}
            </Text>
          </Glass>
        </Animated.View>
      )}
    </Animated.ScrollView>
    <EpisodeSheet list={eps} index={open} onIndex={setOpen} onClose={() => setOpen(null)} isDone={n => !!p.done[n]} onToggle={toggle} />
    </>
  );
}

function NavButton({ dir, enabled, onPress }: { dir: 'left' | 'right'; enabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!enabled}
      hitSlop={12}
      style={({ pressed }) => [styles.navBtn, !enabled && { opacity: 0.3 }, pressed && { transform: [{ scale: 0.92 }] }]}
      accessibilityRole="button"
      accessibilityLabel={dir === 'left' ? 'Previous episodes' : 'Next episodes'}
    >
      <IconChevron dir={dir} size={18} color={C.ink} strokeWidth={2.2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.lg, marginTop: S.lg },
  navBtn: { width: 44, height: 44, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', backgroundColor: GLASS.field, borderWidth: 1, borderColor: GLASS.borderHi },
  header: { alignItems: 'center', marginTop: S.xs },
  greeting: { ...T.greeting, fontSize: 13, lineHeight: 18 },
  date: { fontFamily: FONT[700], fontSize: 17, lineHeight: 24, color: C.ink, marginTop: 2, letterSpacing: 0.2 },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: S.xl, marginTop: S.xxl, marginBottom: S.md, minHeight: 28 },
  todayChip: { paddingHorizontal: S.md, minHeight: 32, borderRadius: R.sm, justifyContent: 'center', backgroundColor: GLASS.field, borderWidth: 1, borderColor: GLASS.borderHi },
  todayChipText: { fontFamily: FONT[700], fontSize: 11, letterSpacing: 1.1, color: C.ink },
  cards: { paddingHorizontal: S.lg, gap: S.md },
  note: { padding: S.lg },
});
