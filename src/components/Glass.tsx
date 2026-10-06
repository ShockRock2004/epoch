import React, { createContext } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GLASS, R } from '../theme';

/** Kept for the App shell; panels no longer blur. */
export const BlurTargetContext = createContext<React.RefObject<View | null> | null>(null);

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  variant?: 'glass' | 'solid';
  /** A flat fill instead of the panel gradient (chips, fields). */
  tint?: string;
  border?: string;
  highlight?: boolean;
};

/**
 * A dark purple panel: vertical gradient, hairline violet edge, faint top sheen.
 * The name stays "Glass" so every screen keeps one surface component.
 */
export function Glass({ children, style, radius = R.card, tint, border = GLASS.border, highlight = true }: Props) {
  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden' }, style]}>
      {tint ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: tint }]} />
      ) : (
        <LinearGradient colors={GLASS.panel} style={StyleSheet.absoluteFill} />
      )}
      {highlight && (
        <LinearGradient
          pointerEvents="none"
          colors={[GLASS.highlight, 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, borderWidth: 1, borderColor: border }]} />
      {children}
    </View>
  );
}
