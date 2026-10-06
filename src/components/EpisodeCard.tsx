import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  Easing, interpolate, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import type { Episode, Seg } from '../data/plan';
import { PHASES } from '../data/plan';
import { C, FONT, PHASE_COLOR, R, alpha, fmtClock, fmtMins } from '../theme';
import { GlassView } from './GlassView';
import { IconCheck, IconClock, IconFlip, IconPlay, IconQuiz } from './Icons';
import { haptic } from '../lib/haptics';
import { openSeg } from '../lib/youtube';

const FLIP_MS = 520;
const HOLD_MS = 650;
const HOLD_DELAY = 180; // a quick tap never shows the fill

type Props = {
  ep: Episode;
  done: boolean;
  onToggle: (n: number) => void;
  blurTarget?: React.RefObject<View | null>;
  minHeight?: number;
  style?: StyleProp<ViewStyle>;
};

const range = (s: Seg) => (s.ranged ? `${fmtClock(s.start)}–${s.end === s.len ? 'end' : fmtClock(s.end)}` : fmtClock(s.len));

export function EpisodeCard({ ep, done, onToggle, blurTarget, minHeight = 188, style }: Props) {
  const [flipped, setFlipped] = useState(false);
  const flip = useSharedValue(0);
  const hold = useSharedValue(0);
  const pop = useSharedValue(1);
  const isReview = !!ep.review;
  const multi = ep.segs.length > 1;
  const tint = PHASE_COLOR[ep.phase];

  const doFlip = () => {
    haptic.select();
    const to = flipped ? 0 : 1;
    setFlipped(!flipped);
    flip.value = withTiming(to, { duration: FLIP_MS, easing: Easing.bezier(0.33, 0, 0.15, 1) });
  };

  // Front and back share one rotation; each hides past 90° so Android never ghosts a face.
  const frontStyle = useAnimatedStyle(() => ({
    opacity: flip.value < 0.5 ? 1 : 0,
    transform: [
      { perspective: 1200 },
      { rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` },
      { scale: 1 - 0.05 * Math.sin(Math.PI * flip.value) },
    ],
  }));
  const backStyle = useAnimatedStyle(() => ({
    opacity: flip.value >= 0.5 ? 1 : 0,
    transform: [
      { perspective: 1200 },
      { rotateY: `${interpolate(flip.value, [0, 1], [180, 360])}deg` },
      { scale: 1 - 0.05 * Math.sin(Math.PI * flip.value) },
    ],
  }));
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 - 0.015 * hold.value }] }));
  const fillStyle = useAnimatedStyle(() => ({ width: `${hold.value * 100}%`, opacity: hold.value > 0.001 ? 1 : 0 }));
  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  const onPressIn = () => {
    hold.value = withDelay(HOLD_DELAY, withTiming(1, { duration: HOLD_MS - HOLD_DELAY, easing: Easing.inOut(Easing.quad) }));
  };
  const onPressOut = () => {
    hold.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.quad) });
  };
  const onLongPress = () => {
    done ? haptic.undo() : haptic.success();
    onToggle(ep.n);
    pop.value = withSequence(withTiming(1.35, { duration: 140 }), withSpring(1, { damping: 9, stiffness: 220 }));
    hold.value = withTiming(0, { duration: 320 });
  };

  const fill = (
    <Animated.View pointerEvents="none" style={[styles.fill, fillStyle]}>
      <LinearGradient
        colors={done ? ['rgba(255,178,92,0.02)', 'rgba(255,178,92,0.18)'] : ['rgba(255,255,255,0.0)', 'rgba(255,255,255,0.14)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.fillEdge, { backgroundColor: done ? '#FFD1A1' : '#FFFFFF' }]} />
    </Animated.View>
  );

  const shell = (children: React.ReactNode, absolute: boolean) => (
    <GlassView
      blurTarget={blurTarget}
      radius={R.xl + 2}
      style={absolute ? StyleSheet.absoluteFill : { minHeight }}
      tint={done ? 'rgba(255,255,255,0.04)' : C.glass}
    >
      {fill}
      {children}
      {done && <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.doneRing]} />}
    </GlassView>
  );

  const header = (
    <View style={styles.row}>
      <View style={styles.tagRow}>
        <Text style={styles.eyebrow}>EPISODE {ep.n}</Text>
        <View style={[styles.tagDot, { backgroundColor: tint }]} />
        <Text style={[styles.eyebrow, { color: tint }]}>{PHASES[ep.phase].short.toUpperCase()}</Text>
      </View>
      <Animated.View style={[styles.badge, done && styles.badgeDone, badgeStyle]}>
        {done && <IconCheck size={13} color={C.accentInk} strokeWidth={3} />}
      </Animated.View>
    </View>
  );

  const watchBtn = (
    <Pressable
      onPress={() => {
        haptic.nav();
        if (isReview) doFlip();
        else openSeg(ep.segs[0]);
      }}
      style={({ pressed }) => [styles.watch, pressed && { transform: [{ scale: 0.95 }] }]}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={isReview ? 'Quiz me' : `Watch ${ep.name} on YouTube`}
    >
      <LinearGradient
        colors={done ? ['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.08)'] : ['#FFFFFF', '#E4ECF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.watchBg}
      >
        {isReview ? <IconQuiz size={16} color={done ? C.ink : C.accentInk} strokeWidth={2.3} /> : <IconPlay size={12} color={done ? C.ink : C.accentInk} />}
        <Text style={[styles.watchText, done && { color: C.ink }]}>{isReview ? 'Quiz me' : done ? 'Rewatch' : multi ? 'Start' : 'Watch'}</Text>
      </LinearGradient>
    </Pressable>
  );

  return (
    <Animated.View style={[pressStyle, style]}>
      <Pressable
        onPress={doFlip}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onLongPress={onLongPress}
        delayLongPress={HOLD_MS}
        accessibilityRole="button"
        accessibilityLabel={`Episode ${ep.n}: ${ep.name}. ${done ? 'Done.' : ''} Tap to flip, hold to mark ${done ? 'not done' : 'done'}.`}
      >
        {/* Front: sets the card's height. */}
        <Animated.View style={[styles.face, frontStyle]} pointerEvents={flipped ? 'none' : 'box-none'}>
          {shell(
            <View style={styles.pad}>
              {header}
              <Text style={styles.name} numberOfLines={2}>{ep.name}</Text>

              {isReview && <Text style={styles.sub}>No video · {ep.review!.q.length} questions to answer out loud</Text>}
              {!isReview && !multi && (
                <Text style={styles.sub} numberOfLines={2}>{ep.segs[0].title}<Text style={styles.subDim}>  ·  {ep.segs[0].channel}</Text></Text>
              )}
              {multi && (
                <View style={styles.list}>
                  {ep.segs.map((s, i) => (
                    <Pressable
                      key={i}
                      onPress={() => { haptic.nav(); openSeg(s); }}
                      style={({ pressed }) => [styles.item, pressed && { backgroundColor: 'rgba(255,255,255,0.10)' }]}
                      accessibilityRole="link"
                      accessibilityLabel={`Play video ${i + 1}: ${s.title}`}
                    >
                      <View style={styles.itemNum}><Text style={styles.itemNumText}>{i + 1}</Text></View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemTitle} numberOfLines={1}>{s.title}</Text>
                        <Text style={styles.itemMeta}>{s.channel} · {range(s)}</Text>
                      </View>
                      <IconPlay size={11} color={C.accent} />
                    </Pressable>
                  ))}
                </View>
              )}

              <View style={{ flex: 1, minHeight: 14 }} />
              <View style={styles.bottom}>
                <View style={styles.metaRow}>
                  <IconClock size={15} color={C.muted} />
                  <Text style={styles.meta}>{isReview ? '~20 min' : fmtMins(ep.secs)}{multi ? `  ·  ${ep.segs.length} videos` : ''}</Text>
                </View>
                {watchBtn}
              </View>
            </View>,
            false,
          )}
        </Animated.View>

        {/* Back: overlays the front at the same size. */}
        <Animated.View style={[StyleSheet.absoluteFill, styles.face, backStyle]} pointerEvents={flipped ? 'box-none' : 'none'}>
          {shell(
            <View style={styles.pad}>
              <View style={styles.row}>
                <Text style={[styles.eyebrow, { color: tint }]}>{isReview ? 'QUESTIONS' : 'IN THIS EPISODE'}</Text>
                <IconFlip size={16} color={C.muted} />
              </View>
              <ScrollView style={{ flex: 1, marginTop: 8 }} showsVerticalScrollIndicator={false} nestedScrollEnabled>
                <Text style={styles.summary}>{ep.summary}</Text>
                {isReview && ep.review!.q.map((q, i) => (
                  <View key={i} style={styles.qRow}>
                    <Text style={styles.qNum}>{i + 1}</Text>
                    <Text style={styles.qText}>{q}</Text>
                  </View>
                ))}
              </ScrollView>
              <Text style={styles.hint}>{done ? 'HOLD TO MARK NOT DONE' : 'HOLD TO MARK DONE'}</Text>
            </View>,
            true,
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  face: { backfaceVisibility: 'hidden' },
  pad: { flex: 1, paddingHorizontal: 18, paddingTop: 16, paddingBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyebrow: { color: C.muted, fontSize: 11, fontFamily: FONT[600], letterSpacing: 1.4 },
  tagDot: { width: 4, height: 4, borderRadius: 2 },
  badge: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.4, borderColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  badgeDone: { backgroundColor: C.good, borderColor: C.good },
  name: { color: C.ink, fontSize: 24, fontFamily: FONT[700], lineHeight: 28, marginTop: 10, letterSpacing: -0.5 },
  sub: { color: C.ink2, fontFamily: FONT[400], fontSize: 13.5, lineHeight: 19, marginTop: 6 },
  subDim: { color: C.muted },
  list: { marginTop: 12, gap: 6 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 10, borderRadius: R.md, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  itemNum: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(156,200,255,0.14)' },
  itemNumText: { color: C.accent, fontFamily: FONT[700], fontSize: 11.5 },
  itemTitle: { color: C.ink, fontFamily: FONT[500], fontSize: 13.5, lineHeight: 17 },
  itemMeta: { color: C.muted, fontFamily: FONT[400], fontSize: 11.5, marginTop: 1, fontVariant: ['tabular-nums'] },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  meta: { color: C.muted, fontFamily: FONT[500], fontSize: 13.5, fontVariant: ['tabular-nums'] },
  watch: { borderRadius: R.pill, overflow: 'hidden' },
  watchBg: { height: 42, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: R.pill },
  watchText: { color: C.accentInk, fontSize: 15, fontFamily: FONT[700], letterSpacing: 0.1 },
  summary: { color: C.ink, fontFamily: FONT[400], fontSize: 15, lineHeight: 22 },
  qRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  qNum: { color: C.accent, fontSize: 13.5, fontFamily: FONT[700], width: 16, lineHeight: 19 },
  qText: { color: C.ink2, fontFamily: FONT[400], fontSize: 13.5, lineHeight: 19, flex: 1 },
  hint: { color: C.faint, fontFamily: FONT[600], fontSize: 10.5, textAlign: 'center', marginTop: 8, letterSpacing: 1.2 },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, overflow: 'hidden' },
  fillEdge: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 2, opacity: 0.85 },
  doneRing: { borderRadius: R.xl + 2, borderWidth: 1.2, borderColor: 'rgba(255,255,255,0.32)' },
});
