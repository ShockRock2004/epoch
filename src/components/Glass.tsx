import React, { createContext, useContext } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { C, GLASS, MATERIAL, MaterialName, R } from '../theme';

type Target = React.RefObject<View | null> | null;

/** The lit background only. Cards blur this: they scroll inside the content, so they can't blur it. */
export const BackdropTargetContext = createContext<Target>(null);
/** Background + scrolling content. Chrome, headers and sheets live outside it and blur it. */
export const ContentTargetContext = createContext<Target>(null);

type Props = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  material?: MaterialName;
  radius?: number;
  /** Overrides the material's tint (e.g. denser glass for a finished episode). */
  tint?: string;
  /** Overrides the material's hairline. */
  border?: string | null;
  /** Rendered inside the clipped glass, under the children (e.g. a progress sweep). */
  underlay?: React.ReactNode;
};

/**
 * Frosted glass, bottom to top:
 * shadow plate (opaque, outside the clip, so Android never draws the shadow through the glass) →
 * blur of the material's target → tint → white scatter → 1 px specular top edge → hairline → children.
 */
export function Glass({ children, style, material = 'card', radius = R.card, tint, border, underlay }: Props) {
  const m = MATERIAL[material];
  const backdrop = useContext(BackdropTargetContext);
  const content = useContext(ContentTargetContext);
  const target = m.target === 'backdrop' ? backdrop : content;
  // Built for one phone (Pixel 7a, Android 13+, minSdk 33), so the RenderEffect blur is always there.
  const blur = !!target;
  const line = border === undefined ? m.border : border;

  return (
    <View style={[{ borderRadius: radius }, style]}>
      {m.elevation > 0 && (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, backgroundColor: C.bg, elevation: m.elevation }]} />
      )}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]}>
        {blur && (
          <BlurView
            blurTarget={target!}
            intensity={m.intensity}
            blurReductionFactor={m.reduction}
            tint="systemChromeMaterialDark"
            blurMethod="dimezisBlurViewSdk31Plus"
            style={StyleSheet.absoluteFill}
          />
        )}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: tint ?? m.tint }]} />
        {blur && <View style={[StyleSheet.absoluteFill, { backgroundColor: GLASS.scatter }]} />}
        {underlay}
        {m.specular && (
          <LinearGradient
            colors={['rgba(255,255,255,0)', GLASS.specular, 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.specular}
          />
        )}
        {line && <View style={[StyleSheet.absoluteFill, { borderRadius: radius, borderWidth: 1, borderColor: line }]} />}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  specular: { position: 'absolute', top: 0, left: 0, right: 0, height: 1 },
});
