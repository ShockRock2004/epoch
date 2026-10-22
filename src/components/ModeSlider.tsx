import { useEffect, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import type { Mode } from '../lib/schedule';
import { C, FONT, GLASS, GRAD, R } from '../theme';
import { IconBolt, IconGauge, IconLock } from './Icons';

const PAD = 4;

/** Two-stop slider: Normal on the left, Hyper on the right. Locked means it no longer moves. */
export function ModeSlider({ value, locked, onPick }: { value: Mode; locked: boolean; onPick: (m: Mode) => void }) {
  const [w, setW] = useState(0);
  const half = (w - PAD * 2) / 2;
  const x = useSharedValue(0);
  const pick = useRef(onPick);
  pick.current = onPick;

  useEffect(() => { x.value = withTiming(value === 'hyper' ? half : 0, { duration: 220 }); }, [value, half, x]);
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8,
    onPanResponderRelease: (_, g) => { if (Math.abs(g.dx) > 24) pick.current(g.dx > 0 ? 'hyper' : 'normal'); },
  })).current;

  const hyper = value === 'hyper';
  return (
    <View style={styles.track} onLayout={e => setW(e.nativeEvent.layout.width)} {...(locked ? {} : pan.panHandlers)}>
      {w > 0 && (
        <Animated.View style={[styles.thumb, { width: half }, thumb]}>
          {hyper ? <LinearGradient colors={GRAD} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={styles.fill} /> : <View style={[styles.fill, { backgroundColor: C.light }]} />}
        </Animated.View>
      )}
      {(['normal', 'hyper'] as const).map(m => {
        const on = m === value;
        const color = on ? (m === 'hyper' ? C.ink : C.onLight) : locked ? C.faint : C.ink2;
        const Icon = m === 'hyper' ? IconBolt : IconGauge;
        return (
          <Pressable
            key={m}
            disabled={locked || on}
            onPress={() => onPick(m)}
            style={styles.cell}
            accessibilityRole="button"
            accessibilityState={{ selected: on, disabled: locked }}
            accessibilityLabel={m === 'hyper' ? 'Hyper mode, 25 days' : 'Normal mode, 50 days'}
          >
            <Icon size={16} color={color} strokeWidth={2} />
            <Text style={[styles.text, { color }, on && { fontFamily: FONT[700] }]}>{m === 'hyper' ? 'Hyper' : 'Normal'}</Text>
            {locked && on && <IconLock size={13} color={color} strokeWidth={2} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', height: 52, padding: PAD, borderRadius: R.md, backgroundColor: GLASS.field, borderWidth: 1, borderColor: GLASS.borderHi },
  thumb: { position: 'absolute', top: PAD, bottom: PAD, left: PAD, borderRadius: R.sm, overflow: 'hidden' },
  fill: { flex: 1 },
  cell: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  text: { fontFamily: FONT[500], fontSize: 13.5 },
});
