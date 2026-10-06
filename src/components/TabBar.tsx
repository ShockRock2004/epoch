import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, FONT } from '../theme';
import { GlassView } from './GlassView';
import { IconChart, IconHome, IconSearch } from './Icons';
import { haptic } from '../lib/haptics';

export type Tab = 'search' | 'home' | 'progress';

const TABS: { key: Tab; label: string; Icon: typeof IconHome }[] = [
  { key: 'search', label: 'Search', Icon: IconSearch },
  { key: 'home', label: 'Home', Icon: IconHome },
  { key: 'progress', label: 'Progress', Icon: IconChart },
];

export const TAB_BAR_H = 68;
const PAD = 6;

export function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const insets = useSafeAreaInsets();
  const [w, setW] = useState(0);
  const idx = TABS.findIndex(t => t.key === tab);
  const x = useSharedValue(idx);

  useEffect(() => {
    x.value = withTiming(idx, { duration: 320, easing: Easing.out(Easing.cubic) });
  }, [idx, x]);

  const slot = w > 0 ? (w - PAD * 2) / TABS.length : 0;
  // The indicator is always mounted and its border never changes, so Android can't
  // leave a stale square outline behind; only its position animates.
  const indicator = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * slot }] }));

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]} pointerEvents="box-none">
      <GlassView radius={TAB_BAR_H / 2} style={styles.pill}>
        <View style={StyleSheet.absoluteFill} onLayout={e => setW(e.nativeEvent.layout.width)} pointerEvents="none" />
        {slot > 0 && (
          <Animated.View pointerEvents="none" style={[styles.indicator, { width: slot }, indicator]}>
            <LinearGradient
              colors={['rgba(200,222,255,0.30)', 'rgba(120,170,240,0.16)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.indicatorFill}
            />
          </Animated.View>
        )}
        {TABS.map(({ key, label, Icon }) => {
          const on = tab === key;
          return (
            <Pressable
              key={key}
              onPress={() => { if (!on) { haptic.nav(); onChange(key); } }}
              style={styles.btn}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              accessibilityLabel={label}
            >
              <Icon size={21} color={on ? C.ink : C.muted} strokeWidth={on ? 2.1 : 1.8} />
              <Text style={[styles.label, on && styles.labelOn]}>{label}</Text>
            </Pressable>
          );
        })}
      </GlassView>
    </View>
  );
}

const R_IN = (TAB_BAR_H - PAD * 2) / 2;

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20 },
  pill: { flexDirection: 'row', padding: PAD, height: TAB_BAR_H },
  indicator: { position: 'absolute', left: PAD, top: PAD, bottom: PAD, borderRadius: R_IN, overflow: 'hidden' },
  indicatorFill: { flex: 1, borderRadius: R_IN, borderWidth: 1, borderColor: 'rgba(220,234,255,0.35)' },
  btn: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  label: { color: C.muted, fontSize: 11.5, fontFamily: FONT[600], letterSpacing: 0.2 },
  labelOn: { color: C.ink },
});
