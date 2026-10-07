import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import type { Episode, Seg } from '../data/plan';
import { PHASES } from '../data/plan';
import { C, FONT, GLASS, PHASE_COLOR, R, S, T, fmtClock, fmtMins } from '../theme';
import { Glass } from './Glass';
import { BlackButton, GradientButton } from './Buttons';
import { IconCheck } from './Icons';
import { toast } from './Overlay';
import { haptic } from '../lib/haptics';
import { openSeg } from '../lib/youtube';

const HOLD_MS = 650;
const HOLD_DELAY = 180; // a quick tap never shows the fill

type Props = {
  ep: Episode;
  done: boolean;
  onToggle: (n: number) => void;
  onOpen: () => void;
  minHeight?: number;
  style?: StyleProp<ViewStyle>;
};

export const pad2 = (n: number) => String(n).padStart(2, '0');
export const segRange = (s: Seg) => (s.ranged ? `${fmtClock(s.start)}–${s.end === s.len ? 'end' : fmtClock(s.end)}` : fmtClock(s.len));

/** Toggle an episode and offer to take it back. */
export function toggleWithUndo(n: number, wasDone: boolean, onToggle: (n: number) => void) {
  wasDone ? haptic.undo() : haptic.success();
  onToggle(n);
  toast.show(`Episode ${n} ${wasDone ? 'marked not done' : 'marked done'}`, { label: 'Undo', onPress: () => { haptic.undo(); onToggle(n); } });
}

/** A bullet list with small violet markers. */
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

/** The visible way to finish an episode: a ring that fills white. */
export function CheckButton({ done, onPress, label }: { done: boolean; onPress: () => void; label: string }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={styles.checkHit}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={label}
    >
      {({ pressed }) => (
        <View style={[styles.check, done && styles.checkOn, pressed && { transform: [{ scale: 0.9 }] }]}>
          {done && <IconCheck size={15} color={C.onLight} strokeWidth={2.8} />}
        </View>
      )}
    </Pressable>
  );
}

export function EpisodeCard({ ep, done, onToggle, onOpen, minHeight = 168, style }: Props) {
  const hold = useSharedValue(0);
  const isReview = !!ep.review;
  const multi = ep.segs.length > 1;
  const toggle = () => toggleWithUndo(ep.n, done, onToggle);

  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 - 0.012 * hold.value }] }));
  const fillStyle = useAnimatedStyle(() => ({ width: `${hold.value * 100}%`, opacity: hold.value > 0.001 ? 1 : 0 }));

  // Holding is a shortcut for the check button, with a soft violet sweep while it fills.
  const onPressIn = () => {
    hold.value = withDelay(HOLD_DELAY, withTiming(1, { duration: HOLD_MS - HOLD_DELAY, easing: Easing.inOut(Easing.quad) }));
  };
  const onPressOut = () => { hold.value = withTiming(0, { duration: 200 }); };
  const onLongPress = () => { toggle(); hold.value = withTiming(0, { duration: 280 }); };

  const fill = (
    <Animated.View style={[styles.fill, fillStyle]}>
      <LinearGradient
        colors={done ? ['rgba(242,179,126,0)', 'rgba(242,179,126,0.18)'] : ['rgba(209,59,240,0.04)', 'rgba(142,45,226,0.38)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.fillEdge, { backgroundColor: done ? C.warn : C.accent }]} />
    </Animated.View>
  );

  const action = isReview ? (
    <GradientButton label="Questions" onPress={() => { haptic.nav(); onOpen(); }} a11y="Show the review questions" />
  ) : done ? (
    <BlackButton label="Rewatch" onPress={() => { haptic.nav(); openSeg(ep.segs[0]); }} a11y={`Rewatch ${ep.name} on YouTube`} />
  ) : (
    <GradientButton label="Start" onPress={() => { haptic.nav(); openSeg(ep.segs[0]); }} a11y={`Start ${ep.name} on YouTube`} />
  );

  return (
    <Animated.View style={[pressStyle, style]}>
      <Pressable
        onPress={() => { haptic.nav(); onOpen(); }}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onLongPress={onLongPress}
        delayLongPress={HOLD_MS}
        accessibilityRole="button"
        accessibilityLabel={`Episode ${ep.n}: ${ep.name}.${done ? ' Done.' : ''} Opens the details.`}
      >
        {/* Finished episodes recede into denser glass; the next one stays clear. */}
        <Glass style={{ minHeight }} tint={done ? 'rgba(18,14,26,0.46)' : undefined} underlay={fill}>
          <View style={[styles.pad, done && styles.dim]}>
            <View style={styles.labelRow}>
              <View style={[styles.dot, { backgroundColor: PHASE_COLOR[ep.phase] }]} />
              <Text style={[T.tag, { flex: 1 }]} numberOfLines={1}>Episode {pad2(ep.n)} · {PHASES[ep.phase].short}</Text>
            </View>
            <Text style={[T.title, styles.title]} numberOfLines={2}>{ep.name}</Text>

            {isReview && <Text style={[T.secondary, styles.sub]}>No video. {ep.review!.q.length} questions to answer out loud.</Text>}
            {!isReview && !multi && (
              <View style={styles.sub}>
                <Text style={T.secondary} numberOfLines={2}>{ep.segs[0].title}</Text>
                <Text style={[T.meta, { marginTop: 2 }]}>{ep.segs[0].channel}</Text>
              </View>
            )}
            {multi && (
              <View style={styles.list}>
                {ep.segs.map((s, i) => (
                  <Pressable
                    key={i}
                    onPress={() => { haptic.nav(); openSeg(s); }}
                    style={({ pressed }) => [styles.item, pressed && { backgroundColor: GLASS.fieldOn }]}
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
          {/* Outside the dimmed block so the control stays at full strength. */}
          <View style={styles.checkSlot}>
            <CheckButton done={done} onPress={toggle} label={done ? `Mark episode ${ep.n} not done` : `Mark episode ${ep.n} done`} />
          </View>
        </Glass>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pad: { flex: 1, padding: S.xl },
  dim: { opacity: 0.72 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm, paddingRight: 44 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  title: { marginTop: S.sm },
  sub: { marginTop: S.sm },
  list: { marginTop: S.md, gap: S.sm },
  item: { flexDirection: 'row', alignItems: 'center', gap: S.sm, minHeight: 48, paddingVertical: S.sm, paddingHorizontal: S.md, borderRadius: R.sm, backgroundColor: GLASS.field, borderWidth: 1, borderColor: GLASS.border },
  itemNum: { fontFamily: FONT[700], fontSize: 12.5, lineHeight: 19, color: C.label, width: 18 },
  itemMeta: { color: C.faint, fontVariant: ['tabular-nums'] },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bullet: { flexDirection: 'row', gap: S.md, alignItems: 'flex-start' },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.pink, marginTop: 8 },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, overflow: 'hidden' },
  fillEdge: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 2 },
  checkSlot: { position: 'absolute', top: S.sm, right: S.sm },
  checkHit: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  check: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.38)', alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: C.light, borderColor: C.light },
});
