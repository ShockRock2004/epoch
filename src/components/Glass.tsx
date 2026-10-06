import React, { createContext, useContext } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { GLASS, R } from '../theme';

/** The ambient background's BlurTargetView, so any glass on screen can blur it. */
export const BlurTargetContext = createContext<React.RefObject<View | null> | null>(null);

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  /** 'glass' blurs the environment; 'solid' is for modals, where nothing sits behind to blur. */
  variant?: 'glass' | 'solid';
  tint?: string;
  border?: string;
  highlight?: boolean;
};

/**
 * Frosted glass: the blurred environment, a smoked tint, a hairline border and a faint
 * highlight along the top edge. Content sits on top at full contrast.
 */
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
      <View style={[StyleSheet.absoluteFill, { backgroundColor: tint ?? (variant === 'solid' ? GLASS.tintSolid : blur ? GLASS.tint : GLASS.tintStrong) }]} />
      {variant === 'solid' && (
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(124,58,237,0.20)', 'rgba(79,70,229,0.06)', 'rgba(79,70,229,0)']}
          locations={[0, 0.35, 0.7]}
          style={StyleSheet.absoluteFill}
        />
      )}
      {highlight && (
        <LinearGradient
          pointerEvents="none"
          colors={[GLASS.highlight, 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 0.6 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, borderWidth: 1, borderColor: border }]} />
      {children}
    </View>
  );
}
