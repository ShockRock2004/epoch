import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, R } from '../theme';
import { GlassView } from './GlassView';
import { IconChart, IconHome, IconSearch } from './Icons';
import { haptic } from '../lib/haptics';

export type Tab = 'search' | 'home' | 'progress';

const TABS: { key: Tab; label: string; Icon: typeof IconHome }[] = [
  { key: 'search', label: 'Search', Icon: IconSearch },
  { key: 'home', label: 'Home', Icon: IconHome },
  { key: 'progress', label: 'Progress', Icon: IconChart },
];

export const TAB_BAR_H = 72;

export function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]} pointerEvents="box-none">
      <GlassView radius={26} style={styles.pill}>
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
              <View style={[styles.hit, on && styles.hitOn]}>
                <Icon size={21} color={on ? C.ink : C.muted} strokeWidth={on ? 2.1 : 1.8} />
                <Text style={[styles.label, on && styles.labelOn]}>{label}</Text>
              </View>
            </Pressable>
          );
        })}
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16 },
  pill: { flexDirection: 'row', padding: 6, height: TAB_BAR_H },
  btn: { flex: 1 },
  hit: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, borderRadius: R.lg },
  hitOn: { backgroundColor: 'rgba(139,147,255,0.22)', borderWidth: 1, borderColor: 'rgba(169,176,255,0.35)' },
  label: { color: C.muted, fontSize: 11.5, fontWeight: '600' },
  labelOn: { color: C.ink },
});
