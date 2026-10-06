import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { C, R } from '../theme';

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** A BlurTargetView ref. Without one the glass is a translucent fill (no real blur). */
  blurTarget?: React.RefObject<View | null>;
  intensity?: number;
  radius?: number;
  tint?: string;
};

/**
 * Frosted glass: real blur of whatever sits inside `blurTarget`, a faint tint,
 * a top-left sheen and a hairline highlight border.
 */
export function GlassView({ children, style, blurTarget, intensity = 40, radius = R.xl, tint = C.glass }: Props) {
  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden' }, style]}>
      {blurTarget ? (
        <BlurView
          blurTarget={blurTarget}
          intensity={intensity}
          tint="dark"
          blurMethod="dimezisBlurViewSdk31Plus"
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: C.glassDeep }]} />
      )}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: tint }]} />
      <LinearGradient
        colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.02)', 'rgba(255,255,255,0)']}
        locations={[0, 0.45, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { borderRadius: radius, borderWidth: 1, borderColor: C.line2, borderBottomColor: C.line }]}
      />
      {children}
    </View>
  );
}
