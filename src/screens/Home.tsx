import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing, FadeIn, FadeInLeft, FadeInRight, FadeOut, useAnimatedStyle, useSharedValue, withRepeat, withTiming,
} from 'react-native-reanimated';
import { BlurTargetView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EPISODES, TOTAL } from '../data/plan';
import { useStore } from '../lib/store';
import { dayNumber, PLAN_DAYS } from '../lib/schedule';
import { C, R, FONT, BG_GRADIENT, BG_LOCATIONS } from '../theme';
import { EpisodeCard } from '../components/EpisodeCard';
import { GlassView } from '../components/GlassView';
import { IconChevron } from '../components/Icons';
import { TopicArt, TOPIC_LABEL } from '../components/illustrations';
import { haptic } from '../lib/haptics';

const longDate = (k: string) => {
  const [y, m, d] = k.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const wd = dt.toLocaleDateString('en-GB', { weekday: 'long' });
  return `${wd}, ${dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
};

const ART = 232;

export function Home({ bottomPad }: { bottomPad: number }) {
  const { p, today, toggle } = useStore();
  const insets = useSafeAreaInsets();
  const target = useRef<View>(null);
  const [offset, setOffset] = useState(0); // pages of two episodes away from today
  const [dir, setDir] = useState<1 | -1>(1);

  // Today's pair is frozen for the day (carry-over included); arrows page through the plan from there.
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

  const sub = offset === 0
    ? day < 1
      ? `Starts in ${-day} day${day === -1 ? '' : 's'}`
      : `Day ${day}${day > PLAN_DAYS ? ' · Overtime' : ''}`
    : offset > 0 ? 'Up next' : 'Earlier';

  const go = (d: 1 | -1) => {
    if ((d > 0 && !canNext) || (d < 0 && !canPrev)) return;
    haptic.select();
    setDir(d);
    setOffset(o => o + d);
  };

  // Snap back to today when the day changes.
  useEffect(() => { setOffset(0); }, [today]);

  const float = useSharedValue(0);
  useEffect(() => {
    float.value = withRepeat(withTiming(1, { duration: 3600, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [float]);
  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -6 * float.value }] }));

  const heroTop = insets.top + 92;
  const enter = (dir > 0 ? FadeInRight : FadeInLeft).duration(380).easing(Easing.out(Easing.cubic));

  return (
    <View style={{ flex: 1 }}>
      {/* Fixed layer: gradient and topic art. Cards scroll over it and blur it. */}
      <BlurTargetView ref={target} style={StyleSheet.absoluteFill}>
        <LinearGradient colors={BG_GRADIENT} locations={BG_LOCATIONS} style={StyleSheet.absoluteFill} />
        <Animated.View style={[{ position: 'absolute', top: heroTop, alignSelf: 'center' }, floatStyle]}>
          <Animated.View key={topic} entering={FadeIn.duration(420)} exiting={FadeOut.duration(200)}>
            <TopicArt topic={topic} size={ART} />
          </Animated.View>
        </Animated.View>
      </BlurTargetView>

      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad + 24 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: insets.top + 18 }]}>
          <Text style={styles.date}>{longDate(today)}</Text>
          <View style={styles.subRow}>
            <Text style={styles.sub}>{sub}</Text>
            <View style={styles.subDot} />
            <Text style={styles.subTopic}>{TOPIC_LABEL[topic]}</Text>
          </View>
        </View>

        {/* Arrows flank the topic art. */}
        <View style={[styles.navRow, { height: ART - 36 }]}>
          <NavButton dir="left" enabled={canPrev} onPress={() => go(-1)} />
          <View style={{ flex: 1 }} />
          <NavButton dir="right" enabled={canNext} onPress={() => go(1)} />
        </View>

        <View style={styles.pageRow}>
          <Text style={styles.pageLabel}>
            {nums.length > 1 ? `EPISODES ${nums[0]}–${nums[nums.length - 1]}` : `EPISODE ${nums[0]}`}
            <Text style={styles.pageOf}>  /  {TOTAL}</Text>
          </Text>
          {offset !== 0 && (
            <Pressable onPress={() => { haptic.nav(); setDir(offset > 0 ? -1 : 1); setOffset(0); }} style={styles.todayChip} accessibilityRole="button">
              <Text style={styles.todayChipText}>Back to today</Text>
            </Pressable>
          )}
        </View>

        <Animated.View key={nums.join('-')} entering={enter} style={styles.body}>
          {eps.map(ep => (
            <EpisodeCard key={ep.n} ep={ep} done={!!p.done[ep.n]} onToggle={toggle} blurTarget={target} />
          ))}
        </Animated.View>

        {(todayDone || allDone) && (
          <Animated.View entering={FadeIn.duration(360)} style={{ paddingHorizontal: 16, marginTop: 12 }}>
            <GlassView blurTarget={target} radius={R.xl} tint="rgba(156,200,255,0.08)" style={styles.doneBox}>
              <Text style={styles.doneTitle}>{allDone ? 'Plan complete. All 100 episodes.' : "That's today done."}</Text>
              <Text style={styles.doneSub}>
                {allDone ? 'Do the mock interviews out loud with a friend.' : 'Tap → if you want to keep going. Otherwise, on to your other targets.'}
              </Text>
            </GlassView>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

function NavButton({ dir, enabled, onPress }: { dir: 'left' | 'right'; enabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!enabled}
      hitSlop={10}
      style={({ pressed }) => [{ opacity: enabled ? 1 : 0.3 }, pressed && { transform: [{ scale: 0.92 }] }]}
      accessibilityRole="button"
      accessibilityLabel={dir === 'left' ? 'Previous episodes' : 'Next episodes'}
    >
      <GlassView radius={24} style={styles.navBtn}>
        <IconChevron dir={dir} size={20} color={C.ink} strokeWidth={2.2} />
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', height: undefined },
  date: { color: C.ink, fontSize: 21, fontFamily: FONT[700], letterSpacing: -0.6 },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 },
  sub: { color: C.ink2, fontSize: 14, fontFamily: FONT[500] },
  subDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: C.muted },
  subTopic: { color: C.accent, fontSize: 14, fontFamily: FONT[600] },
  navRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 14 },
  navBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  pageRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 10, minHeight: 30 },
  pageLabel: { color: C.ink2, fontSize: 11.5, fontFamily: FONT[600], letterSpacing: 1.4 },
  pageOf: { color: C.faint },
  todayChip: { paddingHorizontal: 12, height: 30, borderRadius: R.pill, justifyContent: 'center', backgroundColor: 'rgba(156,200,255,0.16)', borderWidth: 1, borderColor: 'rgba(200,222,255,0.3)' },
  todayChipText: { color: C.accent, fontSize: 12.5, fontFamily: FONT[600] },
  body: { paddingHorizontal: 16, gap: 12 },
  doneBox: { padding: 18 },
  doneTitle: { color: C.ink, fontSize: 17, fontFamily: FONT[700] },
  doneSub: { color: C.muted, fontSize: 13.5, marginTop: 3, fontFamily: FONT[400], lineHeight: 19 },
});
