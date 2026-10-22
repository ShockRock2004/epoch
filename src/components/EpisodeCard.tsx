import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  Easing, SharedValue, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
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

const HOLD_MS = 700;
const HOLD_DELAY = 150; // a quick tap never shows the charge
const ARC_R = 17;
const ARC_LEN = 2 * Math.PI * ARC_R;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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

type Charge = { hold: SharedValue<number>; burst: SharedValue<number>; id: string; undo: boolean };

/**
 * The visible way to finish an episode: a ring that fills white.
 * With a charge, holding the card draws a gradient arc around it, and finishing sends out a pulse.
 */
export function CheckButton({ done, onPress, label, charge }: { done: boolean; onPress: () => void; label: string; charge?: Charge }) {
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
        <>
          {charge && <ChargeRing charge={charge} />}
          <View style={[styles.check, done && styles.checkOn, pressed && { transform: [{ scale: 0.9 }] }]}>
            {done && <IconCheck size={15} color={C.onLight} strokeWidth={2.8} />}
          </View>
        </>
      )}
    </Pressable>
  );
}

function ChargeRing({ charge: { hold, burst, id, undo } }: { charge: Charge }) {
  const arc = useAnimatedProps(() => ({ strokeDashoffset: ARC_LEN * (1 - hold.value) }));
  const arcWrap = useAnimatedStyle(() => ({ opacity: hold.value > 0.01 ? 1 : 0, transform: [{ scale: 1 + 0.06 * hold.value }] }));
  const pulse = useAnimatedStyle(() => ({
    opacity: burst.value > 0 && burst.value < 1 ? 0.9 * (1 - burst.value) : 0,
    transform: [{ scale: 1 + 1.5 * burst.value }],
  }));
  const bloom = useAnimatedStyle(() => ({
    opacity: burst.value > 0 && burst.value < 1 ? 0.55 * (1 - burst.value) : 0.4 * hold.value,
    transform: [{ scale: 0.8 + 0.6 * Math.max(hold.value, burst.value) }],
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.bloom, bloom, undo && { backgroundColor: 'rgba(255,255,255,0.18)' }]} />
      <Animated.View style={[styles.pulse, pulse]} />
      <Animated.View style={[styles.arc, arcWrap]}>
        <Svg width={ARC_R * 2 + 4} height={ARC_R * 2 + 4}>
          <Defs>
            <SvgGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={undo ? '#FFFFFF' : '#F0ABFC'} />
              <Stop offset="1" stopColor={undo ? '#9B8BB4' : '#8E2DE2'} />
            </SvgGradient>
          </Defs>
          <AnimatedCircle
            cx={ARC_R + 2}
            cy={ARC_R + 2}
            r={ARC_R}
            stroke={`url(#${id})`}
            strokeWidth={2.5}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${ARC_LEN} ${ARC_LEN}`}
            rotation={-90}
            origin={`${ARC_R + 2}, ${ARC_R + 2}`}
            animatedProps={arc}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

export function EpisodeCard({ ep, done, onToggle, onOpen, minHeight = 168, style }: Props) {
  const hold = useSharedValue(0); // 0 → 1 while the card is held
  const burst = useSharedValue(0); // 0 → 1 once, right after it is marked done
  const pop = useSharedValue(0);
  const width = useSharedValue(0);
  const [undo, setUndo] = useState(done); // the tone is fixed when the hold starts, so it can't flip mid-pulse
  const buzz = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isReview = !!ep.review;
  const multi = ep.segs.length > 1;
  const toggle = () => toggleWithUndo(ep.n, done, onToggle);

  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 - 0.018 * hold.value + 0.012 * pop.value }] }));
  // A glow that charges from the check ring's corner, and a violet rim that lights with it.
  const glowStyle = useAnimatedStyle(() => ({ opacity: hold.value }));
  const rimStyle = useAnimatedStyle(() => ({ opacity: burst.value > 0 && burst.value < 1 ? Math.max(hold.value, 1 - burst.value) : hold.value }));
  // One diagonal sheen across the glass when an episode is finished.
  const sheenStyle = useAnimatedStyle(() => ({
    opacity: burst.value > 0 && burst.value < 1 ? 1 : 0,
    transform: [{ translateX: -0.6 * width.value + 1.9 * width.value * burst.value }, { rotate: '18deg' }],
  }));

  const clearBuzz = () => { if (buzz.current) clearTimeout(buzz.current); buzz.current = null; };

  // Holding is a shortcut for the check button: the ring charges, then the card confirms.
  const onPressIn = () => {
    setUndo(done);
    hold.value = withDelay(HOLD_DELAY, withTiming(1, { duration: HOLD_MS - HOLD_DELAY, easing: Easing.inOut(Easing.cubic) }));
    buzz.current = setTimeout(haptic.hold, HOLD_DELAY);
  };
  const onPressOut = () => { clearBuzz(); hold.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) }); };
  const onLongPress = () => {
    clearBuzz();
    const finishing = !done;
    toggle();
    hold.value = withTiming(0, { duration: 380, easing: Easing.out(Easing.cubic) });
    pop.value = withSequence(withTiming(1, { duration: 130, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 420, easing: Easing.out(Easing.back(2)) }));
    if (finishing) {
      burst.value = 0;
      burst.value = withTiming(1, { duration: 640, easing: Easing.out(Easing.cubic) });
    }
  };

  const underlay = (
    <>
      <Animated.View style={[StyleSheet.absoluteFill, glowStyle]}>
        <LinearGradient
          colors={undo ? ['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.03)', 'rgba(255,255,255,0)'] : ['rgba(209,59,240,0.42)', 'rgba(142,45,226,0.16)', 'rgba(74,14,143,0)']}
          locations={[0, 0.45, 1]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0.1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View style={[styles.sheen, sheenStyle]}>
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.13)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View style={[styles.rim, { borderColor: undo ? 'rgba(255,255,255,0.32)' : C.accentLine }, rimStyle]} />
    </>
  );

  const action = isReview ? (
    <GradientButton label="Questions" onPress={() => { haptic.nav(); onOpen(); }} a11y="Show the review questions" />
  ) : done ? (
    <BlackButton label="Rewatch" onPress={() => { haptic.nav(); openSeg(ep.segs[0]); }} a11y={`Rewatch ${ep.name} on YouTube`} />
  ) : (
    <GradientButton label="Start" onPress={() => { haptic.nav(); openSeg(ep.segs[0]); }} a11y={`Start ${ep.name} on YouTube`} />
  );

  return (
    <Animated.View style={[pressStyle, style]} onLayout={e => { width.value = e.nativeEvent.layout.width; }}>
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
        <Glass style={{ minHeight }} tint={done ? 'rgba(18,14,26,0.46)' : undefined} underlay={underlay}>
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
            <CheckButton done={done} onPress={toggle} charge={{ hold, burst, id: `charge-${ep.n}`, undo }} label={done ? `Mark episode ${ep.n} not done` : `Mark episode ${ep.n} done`} />
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
  sheen: { position: 'absolute', top: '-50%', bottom: '-50%', left: 0, width: '34%' },
  rim: { ...StyleSheet.absoluteFill, borderRadius: R.card, borderWidth: 1.5 },
  checkSlot: { position: 'absolute', top: S.sm, right: S.sm },
  checkHit: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  arc: { position: 'absolute', left: 24 - ARC_R - 2, top: 24 - ARC_R - 2 },
  pulse: { position: 'absolute', left: 10, top: 10, width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: C.accent },
  bloom: { position: 'absolute', left: 4, top: 4, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(209,59,240,0.35)' },
  check: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.38)', alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: C.light, borderColor: C.light },
});
