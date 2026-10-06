import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, FONT, GRAD, R, S } from '../theme';
import { Glass } from './Glass';

type BtnProps = { label: string; onPress: () => void; icon?: React.ReactNode; style?: StyleProp<ViewStyle>; height?: number; a11y?: string };

/** Primary action: the one place the magenta → violet gradient fills a surface. */
export function GradientButton({ label, onPress, icon, style, height = 42, a11y }: BtnProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [style, pressed && { transform: [{ scale: 0.96 }] }]} accessibilityRole="button" accessibilityLabel={a11y ?? label}>
      <LinearGradient colors={GRAD} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={[styles.btn, { height }]}>
        {icon}
        <Text style={styles.gradText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

/** Secondary action: black, white tracked capitals. */
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

/** A glass strip whose active cell is a white square. */
export function GradientSegment<K extends string>({ items, value, onChange }: { items: [K, string][]; value: K; onChange: (k: K) => void }) {
  return (
    <Glass radius={R.md} style={styles.seg}>
      <View style={styles.segRow}>
        {items.map(([k, l]) => {
          const on = k === value;
          return (
            <Pressable key={k} onPress={() => onChange(k)} style={[styles.segCell, on && styles.segOn]} accessibilityRole="button" accessibilityState={{ selected: on }}>
              <Text style={[styles.segText, on && styles.segTextOn]}>{l}</Text>
            </Pressable>
          );
        })}
      </View>
    </Glass>
  );
}

const styles = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: S.sm, paddingHorizontal: S.xl, borderRadius: R.md },
  gradText: { color: C.ink, fontFamily: FONT[700], fontSize: 13.5 },
  black: { backgroundColor: C.black, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  blackText: { color: C.ink, fontFamily: FONT[600], fontSize: 11.5, letterSpacing: 1.8 },
  seg: { height: 46 },
  segRow: { flex: 1, flexDirection: 'row', padding: 4 },
  segCell: { flex: 1, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: C.light },
  segText: { color: C.ink2, fontFamily: FONT[500], fontSize: 12.5 },
  segTextOn: { color: C.onLight, fontFamily: FONT[700] },
});
