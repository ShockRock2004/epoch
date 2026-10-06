import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { BG_GRADIENT, BG_LOCATIONS, C, FONT } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 132;
const W = 6.4;
const R0 = SIZE / 2 - W;
const L = 2 * Math.PI * R0;
const GAP_START = -28; // the ring runs clockwise from here…
const SPAN = 326;      // …and stops short, leaving a gap for the dot
const ARC = (SPAN / 360) * L;
const MID = ((GAP_START - (360 - SPAN) / 2) * Math.PI) / 180;

/**
 * Opening: the ring draws itself, the dot settles into the gap, the wordmark rises,
 * then everything dissolves into the app. About 1.6 s; tapping skips it.
 */
export function Opening({ onDone }: { onDone: () => void }) {
  const draw = useSharedValue(0);
  const dot = useSharedValue(0);
  const word = useSharedValue(0);
  const out = useSharedValue(0);

  const finish = () => {
    out.value = withTiming(1, { duration: 380, easing: Easing.in(Easing.quad) }, f => { if (f) scheduleOnRN(onDone); });
  };

  useEffect(() => {
    draw.value = withTiming(1, { duration: 820, easing: Easing.bezier(0.65, 0, 0.35, 1) });
    dot.value = withDelay(640, withSpring(1, { damping: 11, stiffness: 180 }));
    word.value = withDelay(520, withTiming(1, { duration: 620, easing: Easing.out(Easing.cubic) }));
    const t = setTimeout(finish, 1250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: ARC * (1 - draw.value) }));
  const dotProps = useAnimatedProps(() => ({ r: W * 0.95 * dot.value }));
  const wordStyle = useAnimatedStyle(() => ({
    opacity: word.value,
    letterSpacing: 10 - 6 * word.value,
    transform: [{ translateY: 10 * (1 - word.value) }],
  }));
  const rootStyle = useAnimatedStyle(() => ({ opacity: 1 - out.value }));
  const markStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + 0.08 * out.value }] }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, rootStyle]}>
      <Pressable style={styles.center} onPress={finish} accessibilityLabel="Skip intro">
        <LinearGradient colors={BG_GRADIENT} locations={BG_LOCATIONS} style={StyleSheet.absoluteFill} />
        <Animated.View style={markStyle}>
          <Svg width={SIZE} height={SIZE}>
            <AnimatedCircle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R0}
              stroke={C.ink}
              strokeWidth={W}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${ARC} ${L}`}
              animatedProps={ringProps}
              rotation={GAP_START}
              origin={`${SIZE / 2}, ${SIZE / 2}`}
            />
            <AnimatedCircle
              cx={SIZE / 2 + R0 * Math.cos(MID)}
              cy={SIZE / 2 + R0 * Math.sin(MID)}
              fill={C.accent}
              animatedProps={dotProps}
            />
          </Svg>
        </Animated.View>
        <Animated.Text style={[styles.word, wordStyle]}>EPOCH</Animated.Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  word: { color: C.ink, fontFamily: FONT[600], fontSize: 18, marginTop: 28 },
});
