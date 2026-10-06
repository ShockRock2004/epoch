import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop, Ellipse } from 'react-native-svg';
import { C } from '../theme';

type Blob = { id: string; cx: number; cy: number; rx: number; ry: number; color: string; o: number };

// A black screen lit from the top, like the reference: violet glow behind the hero, falling off to black.
const BLOBS: Blob[] = [
  { id: 'a', cx: 0.5, cy: 0.12, rx: 1.15, ry: 0.42, color: C.electric, o: 0.62 },
  { id: 'b', cx: 0.5, cy: 0.05, rx: 0.6, ry: 0.2, color: C.pink, o: 0.28 },
  { id: 'c', cx: 0.5, cy: 1.05, rx: 1.1, ry: 0.3, color: C.deepViolet, o: 0.5 },
];

export function Ambient() {
  const { width: w, height: h } = useWindowDimensions();
  return (
    <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
      <Defs>
        {BLOBS.map(b => (
          <RadialGradient key={b.id} id={b.id} cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={b.color} stopOpacity={b.o} />
            <Stop offset="0.5" stopColor={b.color} stopOpacity={b.o * 0.4} />
            <Stop offset="1" stopColor={b.color} stopOpacity={0} />
          </RadialGradient>
        ))}
      </Defs>
      <Rect width={w} height={h} fill={C.bg} />
      {BLOBS.map(b => (
        <Ellipse key={b.id} cx={b.cx * w} cy={b.cy * h} rx={b.rx * w} ry={b.ry * h} fill={`url(#${b.id})`} />
      ))}
    </Svg>
  );
}
