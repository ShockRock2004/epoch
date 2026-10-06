import React, { createContext, useContext } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { GLASS, R } from '../theme';

/** The environment's BlurTargetView, so any glass on screen can blur it. */
export const BlurTargetContext = createContext<React.RefObject<View | null> | null>(null);

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  /** 'glass' blurs the environment; 'solid' is for modals, which are separate windows with nothing to blur. */
  variant?: 'glass' | 'solid';
  tint?: string;
  border?: string;
  highlight?: boolean;
};

/** Frosted glass: expo-blur of the environment, a smoked tint, a top sheen and a white hairline. */
export function Glass({ children, style, radius = R.card, variant = 'glass', tint, border = GLASS.border, highlight = true }: Props) {
  const target = useContext(BlurTargetContext);
  const blur = variant === 'glass' && target;
  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden' }, style]}>
      {blur && (
        <BlurView
          blurTarget={target}
          intensity={GLASS.intensity}
          tint="dark"
          blurMethod="dimezisBlurViewSdk31Plus"
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: tint ?? (variant === 'solid' ? GLASS.tintSolid : GLASS.tint) }]} />
      {highlight && (
        <LinearGradient
          pointerEvents="none"
          colors={[GLASS.highlight, 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.55 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, borderWidth: 1, borderColor: border }]} />
      {children}
    </View>
  );
}
