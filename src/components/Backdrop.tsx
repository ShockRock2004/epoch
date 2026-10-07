import React, { createContext, useContext, useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { SharedValue, useAnimatedScrollHandler, useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { C } from '../theme';

/** The active screen's scroll offset. The backdrop drifts with it so the frost visibly moves. */
export const ScrollYContext = createContext<SharedValue<number> | null>(null);

/** Attach to a screen's Animated.ScrollView `onScroll` to drive the backdrop parallax. */
export function useBackdropScroll() {
  const y = useContext(ScrollYContext);
  return useAnimatedScrollHandler(e => { if (y) y.value = e.contentOffset.y; });
}

const PARALLAX = 0.2;
const EXTRA = 0.5; // the backdrop is 1.5 screens tall, so parallax never runs out of picture

// A tiny seeded PRNG, so the dust is identical on every launch.
const rand = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

/**
 * The environment glass sits on. Still mostly black, but with three things frost needs to be seen:
 * light pools at every height, crisp 1 px orbit lines and fine dust. Glass turns the lines into soft
 * bands and the dust into glints, and they shift as you scroll.
 */
export function Backdrop() {
  const { width: w, height: h } = useWindowDimensions();
  const y = useContext(ScrollYContext);
  const H = h * (1 + EXTRA);

  const dust = useMemo(() => {
    const r = rand(7);
    return Array.from({ length: 46 }, () => ({ x: r() * w, y: r() * H, s: 0.7 + r() * 1.1, o: 0.14 + r() * 0.3 }));
  }, [w, H]);

  const drift = useAnimatedStyle(() => {
    const v = y ? Math.min(Math.max(y.value, 0) * PARALLAX, h * EXTRA) : 0;
    return { transform: [{ translateY: -v }] };
  });

  // Orbits: the Epoch ring, echoed off-screen right.
  const ox = w * 1.08, oy = h * 0.36;
  const orbits = [0.42, 0.62, 0.84, 1.08, 1.36];
  // A few small bodies behind where cards sit (never behind the header): discs with a defined edge,
  // so the glass visibly melts them as they pass underneath.
  const bodies = [
    { x: 0.12, y: 0.66, r: 13 }, { x: 0.86, y: 0.84, r: 8 }, { x: 0.3, y: 1.02, r: 10 }, { x: 0.74, y: 1.22, r: 6 },
  ].map(b => ({ x: w * b.x, y: h * b.y, r: b.r }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { height: H }, drift]}>
      <Svg width={w} height={H}>
        <Defs>
          <LinearGradient id="base" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={C.bg} />
            <Stop offset="1" stopColor="#0B0812" />
          </LinearGradient>
          <RadialGradient id="top" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor="#7C3AED" stopOpacity={0.42} />
            <Stop offset="0.5" stopColor="#6D28D9" stopOpacity={0.14} />
            <Stop offset="1" stopColor="#6D28D9" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="mid" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor="#5B21B6" stopOpacity={0.3} />
            <Stop offset="1" stopColor="#4C1D95" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="low" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor="#C026D3" stopOpacity={0.16} />
            <Stop offset="1" stopColor="#C026D3" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="spark" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor="#D946EF" stopOpacity={0.16} />
            <Stop offset="1" stopColor="#D946EF" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor="#A855F7" stopOpacity={0.22} />
            <Stop offset="1" stopColor="#A855F7" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={w} height={H} fill="url(#base)" />
        <Ellipse cx={w * 0.5} cy={0} rx={w * 0.95} ry={h * 0.22} fill="url(#top)" />
        <Ellipse cx={w * 0.62} cy={h * 0.02} rx={w * 0.45} ry={h * 0.09} fill="url(#spark)" />
        <Ellipse cx={w * 0.12} cy={h * 0.58} rx={w * 0.75} ry={h * 0.3} fill="url(#mid)" />
        <Ellipse cx={w * 0.9} cy={h * 0.9} rx={w * 0.6} ry={h * 0.24} fill="url(#low)" />
        <Ellipse cx={w * 0.2} cy={h * 1.3} rx={w * 0.7} ry={h * 0.25} fill="url(#mid)" />
        {orbits.map((k, i) => (
          <Ellipse
            key={i}
            cx={ox}
            cy={oy}
            rx={w * k}
            ry={w * k * 0.92}
            stroke="#D8C4FF"
            strokeOpacity={0.17 - i * 0.02}
            strokeWidth={1.5}
            fill="none"
          />
        ))}
        {bodies.map((b, i) => (
          <React.Fragment key={i}>
            <Circle cx={b.x} cy={b.y} r={b.r * 2.4} fill="url(#halo)" />
            <Circle cx={b.x} cy={b.y} r={b.r} fill="#B98CFF" fillOpacity={0.18} stroke="#E9DDFF" strokeOpacity={0.22} strokeWidth={1} />
          </React.Fragment>
        ))}
        {dust.map((d, i) => <Circle key={i} cx={d.x} cy={d.y} r={d.s} fill="#FFFFFF" fillOpacity={d.o} />)}
      </Svg>
    </Animated.View>
  );
}
