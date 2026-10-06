import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, FONT, S } from '../theme';
import { IconChart, IconHome, IconSearch } from './Icons';
import { haptic } from '../lib/haptics';

export type Tab = 'search' | 'home' | 'progress';

const TABS: { key: Tab; label: string; Icon: typeof IconHome }[] = [
  { key: 'search', label: 'Search', Icon: IconSearch },
  { key: 'home', label: 'Home', Icon: IconHome },
  { key: 'progress', label: 'Progress', Icon: IconChart },
];

export const TAB_BAR_H = 56;
const PAD = 4;
const RADIUS = 18;

/** Space a scrolling screen must leave at the bottom so the bar never covers content. */
export const useTabClearance = () => {
  const insets = useSafeAreaInsets();
  return TAB_BAR_H + Math.max(insets.bottom, S.md) + S.xxl;
};

export function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const insets = useSafeAreaInsets();
  const [w, setW] = useState(0);
  const idx = TABS.findIndex(t => t.key === tab);
  const x = useSharedValue(idx);

  useEffect(() => {
    x.value = withTiming(idx, { duration: 260, easing: Easing.out(Easing.cubic) });
  }, [idx, x]);

  const slot = w > 0 ? (w - PAD * 2) / TABS.length : 0;
  // Always mounted, fixed border: only its position animates, so Android never repaints a stale outline.
  const indicator = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * slot }] }));

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, S.md) }]} pointerEvents="box-none">
      <View style={styles.bar} onLayout={e => setW(e.nativeEvent.layout.width)}>
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
              <Icon size={19} color={on ? C.accent : C.muted} strokeWidth={on ? 2 : 1.7} />
              <Text style={[styles.label, on && styles.labelOn]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: S.xxl },
  bar: {
    flexDirection: 'row',
    height: TAB_BAR_H,
    padding: PAD,
    borderRadius: RADIUS,
    backgroundColor: C.bg2,
    borderWidth: 1,
    borderColor: C.border,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  indicator: { position: 'absolute', left: PAD, top: PAD, bottom: PAD, borderRadius: RADIUS - PAD, backgroundColor: C.raised },
  btn: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  label: { color: C.muted, fontSize: 10.5, fontFamily: FONT[500] },
  labelOn: { color: C.ink },
});
