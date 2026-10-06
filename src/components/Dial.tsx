import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Stop, G } from 'react-native-svg';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import { LinearGradient as ExpoGradient } from 'expo-linear-gradient';
import { C, FONT } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const SWEEP = 300; // degrees of travel, gap at the bottom like a thermostat

/** The reference's thermostat dial: a gradient arc around a dark centre, with the value in the middle. */
export function Dial({ frac, value, unit, caption, size = 210 }: { frac: number; value: string; unit: string; caption: string; size?: number }) {
  const c = size / 2;
  const stroke = 12;
  const r = c - stroke - 6;
  const len = 2 * Math.PI * r;
  const arc = (SWEEP / 360) * len;
  const t = useSharedValue(0);
  useEffect(() => { t.value = withTiming(Math.min(frac, 1), { duration: 1200, easing: Easing.out(Easing.cubic) }); }, [frac, t]);
  const props = useAnimatedProps(() => ({ strokeDasharray: [arc * t.value, len] }));
  const start = 90 + (360 - SWEEP) / 2; // begin bottom-left, run clockwise

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="dialArc" x1="0" y1="1" x2="1" y2="0">
            <Stop offset="0" stopColor="#7C3AED" />
            <Stop offset="0.6" stopColor="#C026D3" />
            <Stop offset="1" stopColor="#F0ABFC" />
          </LinearGradient>
          <RadialGradient id="dialCore" cx="0.5" cy="0.35" r="0.7">
            <Stop offset="0" stopColor="#2A1446" />
            <Stop offset="1" stopColor="#0B0614" />
          </RadialGradient>
          <RadialGradient id="dialGlow" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0.6" stopColor="#C026D3" stopOpacity={0.25} />
            <Stop offset="1" stopColor="#C026D3" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={c} cy={c} r={c} fill="url(#dialGlow)" />
        <Circle cx={c} cy={c} r={r - stroke} fill="url(#dialCore)" stroke="rgba(199,125,255,0.18)" strokeWidth={1} />
        <G rotation={start} origin={`${c}, ${c}`}>
          <Circle cx={c} cy={c} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${arc} ${len}`} />
          <AnimatedCircle cx={c} cy={c} r={r} stroke="url(#dialArc)" strokeWidth={stroke} fill="none" strokeLinecap="round" animatedProps={props} />
        </G>
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]} pointerEvents="none">
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.unit}>{unit}</Text>
        <Text style={styles.caption}>{caption}</Text>
      </View>
    </View>
  );
}

/** The reference's "Rooms & devices" slider: dark track, gradient fill, white knob. */
export function GradientBar({ frac }: { frac: number }) {
  const f = Math.max(0, Math.min(frac, 1));
  return (
    <View style={styles.track}>
      {f > 0 && (
        <ExpoGradient colors={['#7C3AED', '#D946EF']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={[styles.fill, { width: `${f * 100}%` }]} />
      )}
      <View style={[styles.knob, { left: `${f * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  value: { fontFamily: FONT[700], fontSize: 40, color: C.ink, lineHeight: 46, fontVariant: ['tabular-nums'] },
  unit: { fontFamily: FONT[600], fontSize: 11.5, color: C.ink2, letterSpacing: 0.5 },
  caption: { fontFamily: FONT[700], fontSize: 8.5, letterSpacing: 1.6, color: C.label, marginTop: 6 },
  track: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.10)', justifyContent: 'center' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 3 },
  knob: { position: 'absolute', width: 14, height: 14, borderRadius: 7, marginLeft: -7, backgroundColor: C.light, borderWidth: 2, borderColor: '#D946EF' },
});
