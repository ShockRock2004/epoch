import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop, Ellipse } from 'react-native-svg';
import { C } from '../theme';

type Blob = { id: string; cx: number; cy: number; rx: number; ry: number; color: string; o: number };

// Positions are fractions of the screen. Each blob fades to nothing, so there are no edges or bands.
const BLOBS: Blob[] = [
  { id: 'a', cx: 0.5, cy: 0.2, rx: 0.95, ry: 0.32, color: C.electric, o: 0.42 },
  { id: 'b', cx: 0.05, cy: 0.6, rx: 0.85, ry: 0.4, color: C.indigo, o: 0.38 },
  { id: 'c', cx: 1.0, cy: 0.5, rx: 0.7, ry: 0.34, color: C.magenta, o: 0.26 },
  { id: 'e', cx: 0.7, cy: 0.78, rx: 0.8, ry: 0.28, color: C.violet, o: 0.30 },
  { id: 'd', cx: 0.4, cy: 1.02, rx: 1.0, ry: 0.3, color: C.deepViolet, o: 0.6 },
];

/** The environment: near-black lit by soft violet, indigo and magenta light. Static, so blur stays cheap. */
export function Ambient() {
  const { width: w, height: h } = useWindowDimensions();
  return (
    <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
      <Defs>
        {BLOBS.map(b => (
          <RadialGradient key={b.id} id={b.id} cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={b.color} stopOpacity={b.o} />
            <Stop offset="0.45" stopColor={b.color} stopOpacity={b.o * 0.45} />
            <Stop offset="1" stopColor={b.color} stopOpacity={0} />
          </RadialGradient>
        ))}
        <RadialGradient id="vignette" cx="0.5" cy="0.45" r="0.75">
          <Stop offset="0.55" stopColor="#000" stopOpacity={0} />
          <Stop offset="1" stopColor="#000" stopOpacity={0.55} />
        </RadialGradient>
      </Defs>
      <Rect width={w} height={h} fill={C.bg} />
      {BLOBS.map(b => (
        <Ellipse key={b.id} cx={b.cx * w} cy={b.cy * h} rx={b.rx * w} ry={b.ry * h} fill={`url(#${b.id})`} />
      ))}
      <Rect width={w} height={h} fill="url(#vignette)" />
    </Svg>
  );
}
