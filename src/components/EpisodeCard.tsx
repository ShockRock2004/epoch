import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  Easing, interpolate, useAnimatedStyle, useSharedValue, withDelay, withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import type { Episode } from '../data/plan';
import { PHASES } from '../data/plan';
import { C, PHASE_COLOR, R, alpha, fmtClock, fmtMins } from '../theme';
import { GlassView } from './GlassView';
import { IconCheck, IconClock, IconFlip, IconPlay, IconQuiz } from './Icons';
import { haptic } from '../lib/haptics';
import { openSeg } from '../lib/youtube';

const FLIP_MS = 460;
const HOLD_MS = 600;
const HOLD_DELAY = 110; // a quick tap never shows the fill

type Props = {
  ep: Episode;
  done: boolean;
  onToggle: (n: number) => void;
  onWatch: (ep: Episode) => void;
  blurTarget?: React.RefObject<View | null>;
  wide?: boolean;
  height?: number;
  style?: StyleProp<ViewStyle>;
};

export function EpisodeCard({ ep, done, onToggle, onWatch, blurTarget, wide, height = 260, style }: Props) {
  const [flipped, setFlipped] = useState(false);
  const flip = useSharedValue(0);
  const hold = useSharedValue(0);
  const isReview = !!ep.review;
  const tint = PHASE_COLOR[ep.phase];

  const doFlip = () => {
    haptic.select();
    const to = flipped ? 0 : 1;
    setFlipped(!flipped);
    flip.value = withTiming(to, { duration: FLIP_MS, easing: Easing.out(Easing.cubic) });
  };

  const frontStyle = useAnimatedStyle(() => ({
    opacity: flip.value < 0.5 ? 1 : 0,
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` },
      { scale: 1 - 0.045 * Math.sin(Math.PI * flip.value) },
    ],
  }));
  const backStyle = useAnimatedStyle(() => ({
    opacity: flip.value >= 0.5 ? 1 : 0,
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(flip.value, [0, 1], [180, 360])}deg` },
      { scale: 1 - 0.045 * Math.sin(Math.PI * flip.value) },
    ],
  }));
  const fillStyle = useAnimatedStyle(() => ({
    opacity: hold.value > 0 ? 1 : 0,
    transform: [{ scaleX: hold.value }],
  }));

  const onPressIn = () => {
    hold.value = withDelay(HOLD_DELAY, withTiming(1, { duration: HOLD_MS - HOLD_DELAY, easing: Easing.linear }));
  };
  const onPressOut = () => {
    hold.value = withTiming(0, { duration: 160 });
  };
  const onLongPress = () => {
    done ? haptic.undo() : haptic.success();
    onToggle(ep.n);
    hold.value = withTiming(0, { duration: 260 });
  };

  const first = ep.segs[0];
  const subtitle = isReview
    ? ep.review!.title
    : ep.segs.length > 1 ? `${first.title} + ${ep.segs.length - 1} more` : first.title;

  const face = (children: React.ReactNode, extra?: object) => (
    <GlassView blurTarget={blurTarget} radius={R.xl} style={[StyleSheet.absoluteFill, extra]} tint={done ? alpha(C.good, 0.08) : C.glass}>
      <Animated.View pointerEvents="none" style={[styles.fill, { backgroundColor: done ? alpha(C.warn, 0.18) : alpha(C.good, 0.22) }, fillStyle]} />
      {children}
      {done && <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.doneRing]} />}
    </GlassView>
  );

  const badge = (
    <View style={[styles.badge, done && styles.badgeDone]}>
      {done ? <IconCheck size={13} color={C.bg} strokeWidth={3} /> : <View style={[styles.phaseDot, { backgroundColor: tint }]} />}
    </View>
  );

  return (
    <Pressable
      onPress={doFlip}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onLongPress={onLongPress}
      delayLongPress={HOLD_MS}
      accessibilityRole="button"
      accessibilityLabel={`Episode ${ep.n}: ${ep.name}. ${done ? 'Done.' : ''} Tap to flip, hold to mark ${done ? 'not done' : 'done'}.`}
      style={[{ height }, wide ? { width: '100%' } : { flex: 1 }, style]}
    >
      {/* Front */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.face, frontStyle]} pointerEvents={flipped ? 'none' : 'box-none'}>
        {face(
          <View style={styles.pad}>
            <View style={styles.row}>
              <Text style={styles.eyebrow}>Episode {ep.n}</Text>
              {badge}
            </View>
            <Text style={[styles.name, wide && styles.nameWide, done && styles.dim]} numberOfLines={3}>{ep.name}</Text>
            <Text style={[styles.sub, done && styles.dim]} numberOfLines={wide ? 1 : 2}>{subtitle}</Text>
            <View style={{ flex: 1 }} />
            <View style={styles.metaRow}>
              <IconClock size={15} color={C.muted} />
              <Text style={styles.meta}>{isReview ? '~20 min' : fmtMins(ep.secs)}</Text>
              {ep.segs.length > 1 && <Text style={styles.meta}> · {ep.segs.length} parts</Text>}
            </View>
            <Pressable
              onPress={() => {
                haptic.nav();
                if (isReview) doFlip();
                else onWatch(ep);
              }}
              style={({ pressed }) => [styles.watch, pressed && { transform: [{ scale: 0.97 }] }]}
              accessibilityRole="button"
              accessibilityLabel={isReview ? 'Quiz me' : `Watch ${ep.name} on YouTube`}
            >
              <LinearGradient colors={done ? ['#3C4466', '#2E3552'] : [C.accent, C.accent2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.watchBg}>
                {isReview ? <IconQuiz size={15} color="#fff" strokeWidth={2.2} /> : <IconPlay size={13} />}
                <Text style={styles.watchText}>{isReview ? 'Quiz me' : done ? 'Rewatch' : 'Watch'}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}
      </Animated.View>

      {/* Back */}
      <Animated.View style={[StyleSheet.absoluteFill, styles.face, backStyle]} pointerEvents={flipped ? 'box-none' : 'none'}>
        {face(
          <View style={styles.pad}>
            <View style={styles.row}>
              <Text style={[styles.eyebrow, { color: tint }]}>{PHASES[ep.phase].name}</Text>
              <IconFlip size={15} color={C.muted} />
            </View>
            <ScrollView style={{ flex: 1, marginTop: 6 }} showsVerticalScrollIndicator={false} nestedScrollEnabled>
              <Text style={styles.summary}>{ep.summary}</Text>
              {isReview && ep.review!.q.map((q, i) => (
                <View key={i} style={styles.qRow}>
                  <Text style={styles.qNum}>{i + 1}</Text>
                  <Text style={styles.qText}>{q}</Text>
                </View>
              ))}
              {ep.segs.length > 0 && (
                <View style={{ marginTop: 10, gap: 6 }}>
                  {ep.segs.map((s, i) => (
                    <Pressable key={i} onPress={() => { haptic.nav(); openSeg(s); }} style={styles.part} accessibilityRole="link">
                      <IconPlay size={10} color={C.accent} />
                      <Text style={styles.partText} numberOfLines={2}>
                        {s.title}
                        <Text style={styles.partTime}>  {s.ranged ? `${fmtClock(s.start)}–${s.end === s.len ? 'end' : fmtClock(s.end)}` : fmtClock(s.len)}</Text>
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </ScrollView>
            <Text style={styles.hint}>{done ? 'Hold to mark not done' : 'Hold to mark done'}</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  face: { backfaceVisibility: 'hidden' },
  pad: { flex: 1, padding: 14, paddingBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: C.muted, fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  badge: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: C.line2, alignItems: 'center', justifyContent: 'center' },
  badgeDone: { backgroundColor: C.good, borderColor: C.good },
  phaseDot: { width: 7, height: 7, borderRadius: 4 },
  name: { color: C.ink, fontSize: 17, fontWeight: '700', lineHeight: 22, marginTop: 10, letterSpacing: -0.2 },
  nameWide: { fontSize: 19, lineHeight: 24 },
  sub: { color: C.ink2, fontSize: 12.5, lineHeight: 17, marginTop: 6, opacity: 0.8 },
  dim: { opacity: 0.55 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  meta: { color: C.muted, fontSize: 13, fontVariant: ['tabular-nums'] },
  watch: { borderRadius: R.md, overflow: 'hidden' },
  watchBg: { height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: R.md },
  watchText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  summary: { color: C.ink, fontSize: 13.5, lineHeight: 20 },
  qRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  qNum: { color: C.accent, fontSize: 12.5, fontWeight: '700', width: 14, lineHeight: 18 },
  qText: { color: C.ink2, fontSize: 12.5, lineHeight: 18, flex: 1 },
  part: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', paddingVertical: 6, paddingHorizontal: 8, borderRadius: R.sm, backgroundColor: 'rgba(255,255,255,0.05)' },
  partText: { color: C.ink2, fontSize: 12, lineHeight: 16, flex: 1 },
  partTime: { color: C.muted, fontVariant: ['tabular-nums'] },
  hint: { color: C.faint, fontSize: 11.5, textAlign: 'center', marginTop: 6 },
  fill: { ...StyleSheet.absoluteFill, transformOrigin: 'left' },
  doneRing: { borderRadius: R.xl, borderWidth: 1.2, borderColor: alpha(C.good, 0.45) },
});
