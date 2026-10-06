import React, { useEffect } from 'react';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, { Easing, useAnimatedProps, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { alpha } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Ring = { frac: number; color: string };

function Arc({ r, c, frac, color, stroke, delay }: { r: number; c: number; frac: number; color: string; stroke: number; delay: number }) {
  const len = 2 * Math.PI * r;
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = 0;
    t.value = withDelay(delay, withTiming(frac, { duration: 1100, easing: Easing.out(Easing.cubic) }));
  }, [frac, delay, t]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: len * (1 - Math.min(t.value, 1)) }));
  return (
    <G rotation={-90} origin={`${c}, ${c}`}>
      <Circle cx={c} cy={c} r={r} stroke={alpha(color, 0.16)} strokeWidth={stroke} fill="none" />
      <AnimatedCircle
        cx={c}
        cy={c}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${len} ${len}`}
        animatedProps={props}
      />
    </G>
  );
}

/** Apple-Fitness-style concentric rings, outermost first. */
export function Rings({ rings, size = 156, stroke = 13, gap = 4 }: { rings: Ring[]; size?: number; stroke?: number; gap?: number }) {
  const c = size / 2;
  return (
    <Svg width={size} height={size}>
      {rings.map((ring, i) => (
        <Arc key={i} r={c - stroke / 2 - i * (stroke + gap)} c={c} frac={ring.frac} color={ring.color} stroke={stroke} delay={i * 90} />
      ))}
    </Svg>
  );
}
