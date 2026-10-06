import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, FONT, GRAD, R, S } from '../theme';
import { IconChart, IconHome, IconSearch } from './Icons';
import { haptic } from '../lib/haptics';

export type Tab = 'search' | 'home' | 'progress';

const TABS: { key: Tab; label: string; Icon: typeof IconHome }[] = [
  { key: 'search', label: 'Search', Icon: IconSearch },
  { key: 'home', label: 'Home', Icon: IconHome },
  { key: 'progress', label: 'Progress', Icon: IconChart },
];

export const TAB_BAR_H = 60;
const PAD = 5;

/** Space a scrolling screen leaves at the bottom so the floating bar never covers content. */
export const useTabClearance = () => {
  const insets = useSafeAreaInsets();
  return TAB_BAR_H + Math.max(insets.bottom, S.md) + S.xxl;
};

/** The reference's light-switch strip: a gradient bar whose active cell is a white square. */
export function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const insets = useSafeAreaInsets();
  const [w, setW] = useState(0);
  const idx = TABS.findIndex(t => t.key === tab);
  const x = useSharedValue(idx);

  useEffect(() => {
    x.value = withTiming(idx, { duration: 280, easing: Easing.out(Easing.cubic) });
  }, [idx, x]);

  const slot = w > 0 ? (w - PAD * 2) / TABS.length : 0;
  const indicator = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * slot }] }));

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, S.md) }]} pointerEvents="box-none">
      <View style={styles.shadow}>
        <LinearGradient colors={GRAD} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.bar}>
          <View style={styles.row} onLayout={e => setW(e.nativeEvent.layout.width)}>
            {slot > 0 && <Animated.View pointerEvents="none" style={[styles.indicator, { width: slot }, indicator]} />}
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
                  <Icon size={20} color={on ? C.onLight : C.ink} strokeWidth={on ? 2.2 : 1.9} />
                  <Text style={[styles.label, on && styles.labelOn]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: S.xl },
  shadow: { borderRadius: R.lg, shadowColor: '#8E2DE2', shadowOpacity: 0.55, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 10 },
  bar: { height: TAB_BAR_H, borderRadius: R.lg },
  row: { flex: 1, flexDirection: 'row', padding: PAD },
  indicator: { position: 'absolute', left: PAD, top: PAD, bottom: PAD, borderRadius: R.lg - PAD, backgroundColor: C.light },
  btn: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  label: { color: C.ink, fontSize: 10, fontFamily: FONT[600], opacity: 0.9 },
  labelOn: { color: C.onLight, fontFamily: FONT[700], opacity: 1 },
});
