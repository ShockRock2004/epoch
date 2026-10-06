import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, FONT, GRAD, R, S } from '../theme';

type BtnProps = { label: string; onPress: () => void; icon?: React.ReactNode; style?: StyleProp<ViewStyle>; height?: number; a11y?: string };

/** The reference's "Turn ON/OFF": magenta → violet gradient, white text. */
export function GradientButton({ label, onPress, icon, style, height = 42, a11y }: BtnProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.shadow, style, pressed && { transform: [{ scale: 0.96 }] }]} accessibilityRole="button" accessibilityLabel={a11y ?? label}>
      <LinearGradient colors={GRAD} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={[styles.btn, { height }]}>
        {icon}
        <Text style={styles.gradText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

/** The reference's "SIGN IN": solid black, white tracked capitals. */
export function BlackButton({ label, onPress, icon, style, height = 42, a11y }: BtnProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [style, pressed && { transform: [{ scale: 0.96 }] }]} accessibilityRole="button" accessibilityLabel={a11y ?? label}>
      <View style={[styles.btn, styles.black, { height }]}>
        {icon}
        <Text style={styles.blackText}>{label.toUpperCase()}</Text>
      </View>
    </Pressable>
  );
}

/** The reference's light-switch bar: a gradient strip whose active cell is a white square. */
export function GradientSegment<K extends string>({ items, value, onChange }: { items: [K, string][]; value: K; onChange: (k: K) => void }) {
  return (
    <LinearGradient colors={GRAD} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.seg}>
      {items.map(([k, l]) => {
        const on = k === value;
        return (
          <Pressable key={k} onPress={() => onChange(k)} style={[styles.segCell, on && styles.segOn]} accessibilityRole="button" accessibilityState={{ selected: on }}>
            <Text style={[styles.segText, on && styles.segTextOn]}>{l}</Text>
          </Pressable>
        );
      })}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  shadow: { borderRadius: R.md, shadowColor: '#C026D3', shadowOpacity: 0.5, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, paddingHorizontal: S.xl, borderRadius: R.md },
  gradText: { color: C.ink, fontFamily: FONT[700], fontSize: 14 },
  black: { backgroundColor: C.black, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  blackText: { color: C.ink, fontFamily: FONT[700], fontSize: 12.5, letterSpacing: 2 },
  seg: { flexDirection: 'row', borderRadius: R.md, padding: 4, height: 46 },
  segCell: { flex: 1, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: C.light, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  segText: { color: C.ink, fontFamily: FONT[600], fontSize: 12.5 },
  segTextOn: { color: C.onLight, fontFamily: FONT[700] },
});
