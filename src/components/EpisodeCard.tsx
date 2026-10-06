import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import type { Episode, Seg } from '../data/plan';
import { PHASES } from '../data/plan';
import { C, FONT, GLASS, PHASE_COLOR, R, S, T, fmtClock, fmtMins } from '../theme';
import { Glass } from './Glass';
import { BlackButton, GradientButton } from './Buttons';
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

export const pad2 = (n: number) => String(n).padStart(2, '0');
export const segRange = (s: Seg) => (s.ranged ? `${fmtClock(s.start)}–${s.end === s.len ? 'end' : fmtClock(s.end)}` : fmtClock(s.len));

/** A bullet list with small violet markers. Shared by the card back and the detail sheet. */
export function Bullets({ items, gap = S.sm }: { items: string[]; gap?: number }) {
  return (
    <View style={{ gap }}>
      {items.map((b, i) => (
        <View key={i} style={styles.bullet}>
          <View style={styles.bulletDot} />
          <Text style={[T.body, { flex: 1, color: C.ink }]}>{b}</Text>
        </View>
      ))}
    </View>
  );
}

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

  // Hold-to-complete: a soft violet sweep with a bright leading edge.
  const fill = (
    <Animated.View pointerEvents="none" style={[styles.fill, fillStyle]}>
      <LinearGradient
        colors={done ? ['rgba(242,179,126,0)', 'rgba(242,179,126,0.18)'] : ['rgba(209,59,240,0.04)', 'rgba(142,45,226,0.38)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
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
          <Text style={styles.statusText}>DONE</Text>
        </View>
      )}
    </View>
  );

  const action = isReview || !done ? (
    <GradientButton
      label={isReview ? 'Questions' : 'Start'}
      onPress={() => { haptic.nav(); isReview ? doFlip() : openSeg(ep.segs[0]); }}
      a11y={isReview ? 'Show questions' : `Start ${ep.name} on YouTube`}
    />
  ) : (
    <BlackButton label="Rewatch" onPress={() => { haptic.nav(); openSeg(ep.segs[0]); }} a11y={`Rewatch ${ep.name} on YouTube`} />
  );

  return (
    <Animated.View style={[styles.shadow, pressStyle, style]}>
      <Pressable
        onPress={doFlip}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onLongPress={onLongPress}
        delayLongPress={HOLD_MS}
        accessibilityRole="button"
        accessibilityLabel={`Episode ${ep.n}: ${ep.name}.${done ? ' Done.' : ''} Tap for the summary, hold to mark ${done ? 'not done' : 'done'}.`}
      >
        {/* Front sets the card's height. */}
        <Animated.View style={[styles.face, frontStyle]} pointerEvents={flipped ? 'none' : 'box-none'}>
          <Glass style={{ minHeight }} border={done ? C.accentLine : GLASS.border}>
            {fill}
            <View style={styles.pad}>
              {label}
              <Text style={[T.title, styles.title]} numberOfLines={2}>{ep.name}</Text>

              {isReview && <Text style={[T.secondary, styles.sub]}>No video. {ep.review!.q.length} questions to answer out loud.</Text>}
              {!isReview && !multi && (
                <Pressable onPress={() => { haptic.nav(); openSeg(ep.segs[0]); }} style={styles.sub} accessibilityRole="link">
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
                      style={({ pressed }) => [styles.item, pressed && { backgroundColor: 'rgba(199,125,255,0.12)' }]}
                      accessibilityRole="link"
                      accessibilityLabel={`Play video ${i + 1}: ${s.title}`}
                    >
                      <Text style={styles.itemNum}>{i + 1}.</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={T.secondary} numberOfLines={1}>{s.title}</Text>
                        <Text style={[T.meta, styles.itemMeta]}>{s.channel} · {segRange(s)}</Text>
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
          </Glass>
        </Animated.View>

        {/* Back overlays the front at the same size. */}
        <Animated.View style={[StyleSheet.absoluteFill, styles.face, backStyle]} pointerEvents={flipped ? 'box-none' : 'none'}>
          <Glass style={StyleSheet.absoluteFill} border={done ? C.accentLine : GLASS.border}>
            {fill}
            <View style={styles.pad}>
              {label}
              <ScrollView style={{ flex: 1, marginTop: S.md }} showsVerticalScrollIndicator={false} nestedScrollEnabled>
                <Bullets items={ep.points} />
              </ScrollView>
              <Text style={[T.meta, styles.hint]}>Tap to flip back · Hold to mark {done ? 'not done' : 'done'}</Text>
            </View>
          </Glass>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadow: { borderRadius: R.card, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  face: { backfaceVisibility: 'hidden' },
  pad: { flex: 1, padding: S.xl },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  dot: { width: 5, height: 5, borderRadius: 3 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusText: { fontFamily: FONT[700], fontSize: 10, letterSpacing: 1.4, color: C.accent },
  title: { marginTop: S.md },
  sub: { marginTop: S.sm },
  list: { marginTop: S.md, gap: S.sm },
  item: { flexDirection: 'row', alignItems: 'center', gap: S.sm, paddingVertical: S.sm + 1, paddingHorizontal: S.md, borderRadius: R.sm, backgroundColor: GLASS.field, borderWidth: 1, borderColor: GLASS.border },
  itemNum: { fontFamily: FONT[700], fontSize: 12.5, lineHeight: 19, color: C.label, width: 18 },
  itemMeta: { color: C.faint, fontVariant: ['tabular-nums'] },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bullet: { flexDirection: 'row', gap: S.md, alignItems: 'flex-start' },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.pink, marginTop: 8 },
  hint: { textAlign: 'center', marginTop: S.md, color: C.faint },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, overflow: 'hidden' },
  fillEdge: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 2 },
});
