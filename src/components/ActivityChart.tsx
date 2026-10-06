import React from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Defs, LinearGradient, Line, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { C, FONT } from '../theme';

type Props = {
  counts: number[];
  todayIndex: number; // 0-based plan day for today; may be outside 0..len-1
  selected: number | null;
  onSelect: (i: number) => void;
  width: number;
  height?: number;
};

const MAX = 4;
const TARGET = 2;

/** One bar per plan day. Dashed line marks the two-a-day target. */
export function ActivityChart({ counts, todayIndex, selected, onSelect, width, height = 132 }: Props) {
  const n = counts.length;
  const padB = 18;
  const plotH = height - padB;
  const slot = width / n;
  const barW = Math.max(2, slot - 2.2);
  const y = (v: number) => plotH - (Math.min(v, MAX) / MAX) * (plotH - 6);

  return (
    <View>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#F0ABFC" />
            <Stop offset="0.5" stopColor="#C026D3" />
            <Stop offset="1" stopColor="#6D28D9" />
          </LinearGradient>
        </Defs>
        {[1, 2, 3, 4].map(v => (
          <Line key={v} x1={0} x2={width} y1={y(v)} y2={y(v)} stroke={v === TARGET ? 'rgba(232,121,249,0.45)' : 'rgba(255,255,255,0.05)'} strokeWidth={1} strokeDasharray={v === TARGET ? '4 4' : undefined} />
        ))}
        {counts.map((v, i) => {
          const future = i > todayIndex;
          const isToday = i === todayIndex;
          const h = v > 0 ? Math.max(4, plotH - y(v)) : 3;
          const fill = selected === i ? C.ink
            : future ? 'rgba(255,255,255,0.05)'
            : v === 0 ? 'rgba(255,255,255,0.12)'
            : v >= TARGET ? 'url(#barFill)' : 'rgba(199,125,255,0.45)';
          return <Rect key={i} x={i * slot + (slot - barW) / 2} y={plotH - h} width={barW} height={h} rx={Math.min(2.5, barW / 2)} fill={fill} />;
        })}
        {todayIndex >= 0 && todayIndex < n && (
          <Rect x={todayIndex * slot + slot / 2 - 2} y={plotH + 5} width={4} height={4} rx={2} fill={C.accent} />
        )}
        {[0, 9, 19, 29, 39, 49].filter(i => i < n).map(i => (
          <SvgText key={i} x={i * slot + slot / 2} y={height - 1} fill={C.faint} fontSize={10} fontFamily={FONT[500]} textAnchor={i === n - 1 ? 'end' : i === 0 ? 'start' : 'middle'}>{i + 1}</SvgText>
        ))}
      </Svg>
      {/* Touch strip: one transparent hit target per day, so tapping is forgiving. */}
      <View style={{ position: 'absolute', left: 0, top: 0, width, height, flexDirection: 'row' }}>
        {counts.map((_, i) => (
          <Pressable key={i} style={{ width: slot, height }} onPress={() => onSelect(i)} accessibilityLabel={`Day ${i + 1}`} />
        ))}
      </View>
    </View>
  );
}
