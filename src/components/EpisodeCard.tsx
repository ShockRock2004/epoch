import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import type { Episode, Seg } from '../data/plan';
import { PHASES } from '../data/plan';
import { C, FONT, PHASE_COLOR, R, S, T, fmtClock, fmtMins } from '../theme';
import { Surface } from './Surface';
import { IconCheck } from './Icons';
import { haptic } from '../lib/haptics';
import { openSeg } from '../lib/youtube';

const FLIP_MS = 480;
const HOLD_MS = 650;
const HOLD_DELAY = 180; // a quick tap never shows the fill

type Props = {
  ep: Episode;
  done: boolean;
  onToggle: (n: number) => void;
  minHeight?: number;
  style?: StyleProp<ViewStyle>;
};

const pad2 = (n: number) => String(n).padStart(2, '0');
const range = (s: Seg) => (s.ranged ? `${fmtClock(s.start)}–${s.end === s.len ? 'end' : fmtClock(s.end)}` : fmtClock(s.len));

export function EpisodeCard({ ep, done, onToggle, minHeight = 176, style }: Props) {
  const [flipped, setFlipped] = useState(false);
  const flip = useSharedValue(0);
  const hold = useSharedValue(0);
  const isReview = !!ep.review;
  const multi = ep.segs.length > 1;

  const doFlip = () => {
    haptic.select();
    setFlipped(f => !f);
    flip.value = withTiming(flipped ? 0 : 1, { duration: FLIP_MS, easing: Easing.bezier(0.33, 0, 0.15, 1) });
  };

  // One rotation drives both faces; each hides past 90° so Android never shows a ghosted face.
  const frontStyle = useAnimatedStyle(() => ({
    opacity: flip.value < 0.5 ? 1 : 0,
    transform: [{ perspective: 1400 }, { rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` }],
  }));
  const backStyle = useAnimatedStyle(() => ({
    opacity: flip.value >= 0.5 ? 1 : 0,
    transform: [{ perspective: 1400 }, { rotateY: `${interpolate(flip.value, [0, 1], [180, 360])}deg` }],
  }));
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 - 0.012 * hold.value }] }));
  const fillStyle = useAnimatedStyle(() => ({ width: `${hold.value * 100}%`, opacity: hold.value > 0.001 ? 1 : 0 }));

  const onPressIn = () => {
    hold.value = withDelay(HOLD_DELAY, withTiming(1, { duration: HOLD_MS - HOLD_DELAY, easing: Easing.inOut(Easing.quad) }));
  };
  const onPressOut = () => { hold.value = withTiming(0, { duration: 200 }); };
  const onLongPress = () => {
    done ? haptic.undo() : haptic.success();
    onToggle(ep.n);
    hold.value = withTiming(0, { duration: 280 });
  };

  // Hold-to-complete: a quiet wash with a thin leading edge.
  const fill = (
    <Animated.View pointerEvents="none" style={[styles.fill, { backgroundColor: done ? 'rgba(217,160,102,0.08)' : C.accentDim }, fillStyle]}>
      <View style={[styles.fillEdge, { backgroundColor: done ? C.warn : C.accent }]} />
    </Animated.View>
  );

  const label = (
    <View style={styles.labelRow}>
      <Text style={T.label}>EPISODE {pad2(ep.n)}</Text>
      <View style={[styles.dot, { backgroundColor: PHASE_COLOR[ep.phase] }]} />
      <Text style={T.label}>{PHASES[ep.phase].short.toUpperCase()}</Text>
      <View style={{ flex: 1 }} />
      {done && (
        <View style={styles.status}>
          <IconCheck size={13} color={C.accent} strokeWidth={2.4} />
          <Text style={styles.statusText}>Done</Text>
        </View>
      )}
    </View>
  );

  const action = (
    <Pressable
      onPress={() => { haptic.nav(); isReview ? doFlip() : openSeg(ep.segs[0]); }}
      style={({ pressed }) => [done ? styles.btnQuiet : styles.btn, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={isReview ? 'Show questions' : `Start ${ep.name} on YouTube`}
    >
      <Text style={done ? styles.btnQuietText : styles.btnText}>{isReview ? 'Questions' : done ? 'Rewatch' : 'Start'}</Text>
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
        accessibilityLabel={`Episode ${ep.n}: ${ep.name}.${done ? ' Done.' : ''} Tap for summary, hold to mark ${done ? 'not done' : 'done'}.`}
      >
        {/* Front sets the card's height. */}
        <Animated.View style={[styles.face, frontStyle]} pointerEvents={flipped ? 'none' : 'box-none'}>
          <Surface style={{ minHeight }}>
            {fill}
            <View style={styles.pad}>
              {label}
              <Text style={[T.title, styles.title]} numberOfLines={2}>{ep.name}</Text>

              {isReview && <Text style={[T.secondary, styles.sub]}>No video. {ep.review!.q.length} questions to answer out loud.</Text>}
              {!isReview && !multi && (
                <Pressable onPress={() => { haptic.nav(); openSeg(ep.segs[0]); }} style={styles.single} accessibilityRole="link">
                  <Text style={T.secondary} numberOfLines={2}>{ep.segs[0].title}</Text>
                  <Text style={[T.meta, { marginTop: 2 }]}>{ep.segs[0].channel}</Text>
                </Pressable>
              )}
              {multi && (
                <View style={styles.list}>
                  {ep.segs.map((s, i) => (
                    <Pressable
                      key={i}
                      onPress={() => { haptic.nav(); openSeg(s); }}
                      style={({ pressed }) => [styles.item, pressed && { backgroundColor: C.raised }]}
                      accessibilityRole="link"
                      accessibilityLabel={`Play video ${i + 1}: ${s.title}`}
                    >
                      <Text style={styles.itemNum}>{i + 1}.</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={T.secondary} numberOfLines={1}>{s.title}</Text>
                        <Text style={[T.meta, styles.itemMeta]}>{s.channel} · {range(s)}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}

              <View style={{ flex: 1, minHeight: S.lg }} />
              <View style={styles.footer}>
                <Text style={T.meta}>
                  {isReview ? '~20 min' : fmtMins(ep.secs)}{multi ? ` · ${ep.segs.length} videos` : ''}
                </Text>
                {action}
              </View>
            </View>
          </Surface>
        </Animated.View>

        {/* Back overlays the front at the same size. */}
        <Animated.View style={[StyleSheet.absoluteFill, styles.face, backStyle]} pointerEvents={flipped ? 'box-none' : 'none'}>
          <Surface style={StyleSheet.absoluteFill}>
            {fill}
            <View style={styles.pad}>
              {label}
              <ScrollView style={{ flex: 1, marginTop: S.md }} showsVerticalScrollIndicator={false} nestedScrollEnabled>
                <Text style={T.body}>{ep.summary}</Text>
                {isReview && ep.review!.q.map((q, i) => (
                  <View key={i} style={styles.qRow}>
                    <Text style={styles.itemNum}>{i + 1}.</Text>
                    <Text style={[T.secondary, { flex: 1 }]}>{q}</Text>
                  </View>
                ))}
              </ScrollView>
              <Text style={[T.meta, styles.hint]}>Tap to flip back · Hold to mark {done ? 'not done' : 'done'}</Text>
            </View>
          </Surface>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  face: { backfaceVisibility: 'hidden' },
  pad: { flex: 1, padding: S.xl },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  dot: { width: 5, height: 5, borderRadius: 3 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusText: { fontFamily: FONT[500], fontSize: 12, color: C.accent },
  title: { marginTop: S.md },
  sub: { marginTop: S.sm },
  single: { marginTop: S.sm },
  list: { marginTop: S.md, gap: 2 },
  item: { flexDirection: 'row', gap: S.sm, paddingVertical: 6, paddingHorizontal: 6, marginHorizontal: -6, borderRadius: R.sm },
  itemNum: { fontFamily: FONT[500], fontSize: 13.5, lineHeight: 19, color: C.muted, width: 18 },
  itemMeta: { color: C.faint, fontVariant: ['tabular-nums'] },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  btn: { backgroundColor: C.light, borderRadius: R.sm + 2, paddingHorizontal: S.lg + 2, height: 36, justifyContent: 'center' },
  btnText: { fontFamily: FONT[600], fontSize: 14, color: C.onLight },
  btnQuiet: { borderWidth: 1, borderColor: C.border2, borderRadius: R.sm + 2, paddingHorizontal: S.lg, height: 36, justifyContent: 'center' },
  btnQuietText: { fontFamily: FONT[500], fontSize: 14, color: C.ink2 },
  qRow: { flexDirection: 'row', gap: S.sm, marginTop: S.md },
  hint: { textAlign: 'center', marginTop: S.md, color: C.faint },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, overflow: 'hidden' },
  fillEdge: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 1.5 },
});
