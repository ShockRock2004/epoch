import React from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop, Ellipse } from 'react-native-svg';
import { C } from '../theme';

/**
 * The environment: near-black, with one mild violet glow along the top edge.
 * Everything below the top ~15% of the screen is black.
 */
export function Ambient() {
  const { width: w, height: h } = useWindowDimensions();
  return (
    <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id="top" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#7C3AED" stopOpacity={0.42} />
          <Stop offset="0.5" stopColor="#6D28D9" stopOpacity={0.14} />
          <Stop offset="1" stopColor="#6D28D9" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="spark" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#D946EF" stopOpacity={0.16} />
          <Stop offset="1" stopColor="#D946EF" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width={w} height={h} fill={C.bg} />
      <Ellipse cx={w * 0.5} cy={0} rx={w * 0.95} ry={h * 0.22} fill="url(#top)" />
      <Ellipse cx={w * 0.62} cy={h * 0.02} rx={w * 0.45} ry={h * 0.09} fill="url(#spark)" />
    </Svg>
  );
}
