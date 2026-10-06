import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { BlurTargetView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EPISODES, Episode, TOTAL } from '../data/plan';
import { useStore } from '../lib/store';
import { dayNumber, todayView, PLAN_DAYS, MAX_REVEALS } from '../lib/schedule';
import { C, R } from '../theme';
import { EpisodeCard } from '../components/EpisodeCard';
import { GlassView } from '../components/GlassView';
import { IconSpark, IconCheck } from '../components/Icons';
import { TopicArt, TOPIC_LABEL } from '../components/illustrations';
import { PartsSheet } from '../components/PartsSheet';
import { openSeg } from '../lib/youtube';
import { haptic } from '../lib/haptics';

const longDate = (k: string) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
};

export function Home({ bottomPad }: { bottomPad: number }) {
  const { p, today, toggle, reveal } = useStore();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const target = useRef<View>(null);
  const [parts, setParts] = useState<Episode | null>(null);

  const v = todayView(p, today);
  const shown = v.shown.map(n => EPISODES[n - 1]);
  const log = p.days[today] ?? { base: [], revealed: [] };
  const pair = log.base.map(n => EPISODES[n - 1]);
  const extra = log.revealed.map(n => EPISODES[n - 1]);
  const focus = shown.find(e => !p.done[e.n]) ?? shown[shown.length - 1];
  const topic = v.finishedPlan ? 'review' : focus?.topic ?? 'fundamentals';
  const day = dayNumber(p.start, today);
  const doneCount = Object.keys(p.done).length;

  const dayLine = day < 1
    ? `Starts in ${-day} day${day === -1 ? '' : 's'} · ${TOPIC_LABEL[topic]}`
    : `Day ${day}${day > PLAN_DAYS ? ' · Overtime' : ''} · ${TOPIC_LABEL[topic]}`;

  const float = useSharedValue(0);
  useEffect(() => {
    float.value = withRepeat(withTiming(1, { duration: 3200, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [float]);
  const floatStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -8 * float.value }] }));

  const onWatch = (ep: Episode) => (ep.segs.length > 1 ? setParts(ep) : openSeg(ep.segs[0]));

  const artW = Math.min(width - 40, 340);
  const artH = (artW * 220) / 300;
  const headerH = insets.top + 76;
  const cardH = 268;
  const overlap = 56;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad + 24 }} showsVerticalScrollIndicator={false}>
        {/* Everything the glass cards blur lives inside the target. */}
        <BlurTargetView ref={target} style={[StyleSheet.absoluteFill, { height: headerH + artH + cardH + 40 }]}>
          <LinearGradient colors={[C.bg, '#10162A', C.bg2]} style={StyleSheet.absoluteFill} />
          <Animated.View style={[{ position: 'absolute', top: headerH, alignSelf: 'center' }, floatStyle]}>
            <TopicArt topic={topic} width={artW} />
          </Animated.View>
        </BlurTargetView>

        <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
          <Text style={styles.date}>{longDate(today)}</Text>
          <Text style={styles.day}>{dayLine}</Text>
        </View>

        <View style={{ height: artH - overlap }} />

        <View style={styles.body}>
          {pair.length > 0 && (
            <View style={styles.pair}>
              {pair.map(ep => (
                <EpisodeCard
                  key={ep.n}
                  ep={ep}
                  done={!!p.done[ep.n]}
                  onToggle={toggle}
                  onWatch={onWatch}
                  blurTarget={target}
                  height={cardH}
                />
              ))}
            </View>
          )}

          {extra.map(ep => (
            <Animated.View key={ep.n} entering={FadeInDown.duration(420)}>
              <EpisodeCard ep={ep} done={!!p.done[ep.n]} onToggle={toggle} onWatch={onWatch} wide height={212} />
            </Animated.View>
          ))}

          {v.canReveal && (
            <Animated.View entering={FadeInDown.duration(360)}>
              <Pressable
                onPress={() => { haptic.success(); reveal(); }}
                style={({ pressed }) => pressed && { transform: [{ scale: 0.98 }] }}
                accessibilityRole="button"
              >
                <GlassView radius={R.lg} tint="rgba(139,147,255,0.14)" style={styles.reveal}>
                  <IconSpark size={18} color={C.accent} />
                  <Text style={styles.revealText}>Reveal next episode</Text>
                  <Text style={styles.revealLeft}>{MAX_REVEALS - extra.length} left today</Text>
                </GlassView>
              </Pressable>
            </Animated.View>
          )}

          {(v.allDoneForToday || v.finishedPlan) && (
            <Animated.View entering={FadeInDown.duration(360)}>
              <GlassView radius={R.lg} tint="rgba(92,224,160,0.10)" style={styles.doneBox}>
                <View style={styles.doneIcon}><IconCheck size={16} color={C.bg} strokeWidth={3} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.doneTitle}>{v.finishedPlan ? 'Plan complete. All 100 episodes.' : "That's all for today."}</Text>
                  <Text style={styles.doneSub}>
                    {v.finishedPlan ? 'Do the mock interviews out loud with a friend.' : 'Continue with your other targets. More tomorrow.'}
                  </Text>
                </View>
              </GlassView>
            </Animated.View>
          )}

          <Text style={styles.footer}>{doneCount} of {TOTAL} episodes done</Text>
        </View>
      </ScrollView>
      <PartsSheet ep={parts} onClose={() => setParts(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', height: undefined },
  date: { color: C.ink, fontSize: 19, fontWeight: '700', letterSpacing: -0.2 },
  day: { color: C.muted, fontSize: 13.5, marginTop: 4, fontWeight: '500' },
  body: { paddingHorizontal: 16, gap: 12 },
  pair: { flexDirection: 'row', gap: 12 },
  reveal: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, height: 54 },
  revealText: { color: C.ink, fontSize: 15.5, fontWeight: '700', flex: 1 },
  revealLeft: { color: C.muted, fontSize: 12.5 },
  doneBox: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  doneIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.good, alignItems: 'center', justifyContent: 'center' },
  doneTitle: { color: C.ink, fontSize: 15.5, fontWeight: '700' },
  doneSub: { color: C.muted, fontSize: 13, marginTop: 2 },
  footer: { color: C.faint, fontSize: 12.5, textAlign: 'center', marginTop: 8 },
});
