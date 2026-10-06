import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { C, R } from '../theme';

type Tone = 'card' | 'raised' | 'base';

const FILL: Record<Tone, string> = { base: C.bg2, card: C.card, raised: C.raised };

/**
 * The one surface every screen is built from: an opaque slate panel with a thin border.
 * Depth comes from the tone step (base → card → raised), not from blur or glow.
 */
export function Surface({ children, style, tone = 'card', radius = R.card, bordered = true }: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: Tone;
  radius?: number;
  bordered?: boolean;
}) {
  return (
    <View
      style={[
        { backgroundColor: FILL[tone], borderRadius: radius, overflow: 'hidden' },
        bordered && { borderWidth: 1, borderColor: tone === 'raised' ? C.border2 : C.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}
