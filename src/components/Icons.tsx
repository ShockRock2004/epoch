// Hand-drawn 24×24 stroke icons. No icon library.
import React from 'react';
import Svg, { Path, Circle, Rect, Line, Polyline, Defs, LinearGradient, Stop, G } from 'react-native-svg';

type P = { size?: number; color?: string; strokeWidth?: number };
const base = ({ size = 22, color = '#fff', strokeWidth = 1.8 }: P) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
  stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
});

export const IconSearch = (p: P) => (
  <Svg {...base(p)}><Circle cx="10.5" cy="10.5" r="6.5" /><Line x1="15.4" y1="15.4" x2="20" y2="20" /></Svg>
);

export const IconHome = (p: P) => (
  <Svg {...base(p)}>
    <Path d="M4 10.6 12 4l8 6.6V19a1.5 1.5 0 0 1-1.5 1.5H15v-5.2a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5.2H5.5A1.5 1.5 0 0 1 4 19Z" />
  </Svg>
);

export const IconChart = (p: P) => (
  <Svg {...base(p)}>
    <Line x1="6" y1="20" x2="6" y2="13" /><Line x1="12" y1="20" x2="12" y2="5" /><Line x1="18" y1="20" x2="18" y2="10" />
  </Svg>
);

export const IconClock = (p: P) => (
  <Svg {...base(p)}><Circle cx="12" cy="12" r="8.5" /><Polyline points="12 7.5 12 12 15 14" /></Svg>
);

export const IconPlay = ({ size = 14, color = '#fff' }: P) => (
  <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M7 4.8v14.4a1 1 0 0 0 1.5.86l12-7.2a1 1 0 0 0 0-1.72l-12-7.2A1 1 0 0 0 7 4.8Z" fill={color} /></Svg>
);

export const IconCheck = (p: P) => (
  <Svg {...base(p)}><Polyline points="5 12.5 10 17.5 19 7" /></Svg>
);

export const IconFilter = (p: P) => (
  <Svg {...base(p)}>
    <Line x1="4" y1="7" x2="20" y2="7" /><Line x1="7" y1="12" x2="17" y2="12" /><Line x1="10" y1="17" x2="14" y2="17" />
  </Svg>
);

export const IconX = (p: P) => (
  <Svg {...base(p)}><Line x1="6" y1="6" x2="18" y2="18" /><Line x1="18" y1="6" x2="6" y2="18" /></Svg>
);

export const IconGear = (p: P) => (
  <Svg {...base(p)}>
    <Circle cx="12" cy="12" r="3" />
    <Path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.5-2-3.4-2.3.9a7.5 7.5 0 0 0-2.6-1.5L14 2.5h-4l-.5 2.5a7.5 7.5 0 0 0-2.6 1.5l-2.3-.9-2 3.4 2 1.5a7.6 7.6 0 0 0 0 3l-2 1.5 2 3.4 2.3-.9a7.5 7.5 0 0 0 2.6 1.5l.5 2.5h4l.5-2.5a7.5 7.5 0 0 0 2.6-1.5l2.3.9 2-3.4Z" />
  </Svg>
);

export const IconFlip = (p: P) => (
  <Svg {...base(p)}>
    <Path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.7" /><Polyline points="20 4 20 8.7 15.3 8.7" />
    <Path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.3" /><Polyline points="4 20 4 15.3 8.7 15.3" />
  </Svg>
);

export const IconSpark = (p: P) => (
  <Svg {...base(p)}>
    <Path d="M12 3.5 13.8 9a2 2 0 0 0 1.3 1.3l5.4 1.7-5.4 1.7a2 2 0 0 0-1.3 1.3L12 20.5l-1.8-5.5a2 2 0 0 0-1.3-1.3L3.5 12l5.4-1.7A2 2 0 0 0 10.2 9Z" />
  </Svg>
);

export const IconQuiz = (p: P) => (
  <Svg {...base(p)}>
    <Circle cx="12" cy="12" r="8.5" /><Path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.7" /><Circle cx="12" cy="16.8" r="0.4" fill={p.color ?? '#fff'} />
  </Svg>
);

export const IconFlame = (p: P) => (
  <Svg {...base(p)}>
    <Path d="M12 21a6 6 0 0 0 6-6c0-3.5-2.6-5.4-3.4-8.5-.3 1.8-1.3 3-2.6 3.6C12.3 7.5 11 5 8.8 3.5 9 7.5 6 9.6 6 15a6 6 0 0 0 6 6Z" />
  </Svg>
);

export const IconChevron = (p: P & { dir?: 'left' | 'right' | 'down' }) => {
  const d = p.dir === 'left' ? 'M15 5l-7 7 7 7' : p.dir === 'down' ? 'M5 9l7 7 7-7' : 'M9 5l7 7-7 7';
  return <Svg {...base(p)}><Path d={d} /></Svg>;
};

/** The Epoch mark: a ring broken into an orbit, with one bright node. */
export const EpochMark = ({ size = 28 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Defs>
      <LinearGradient id="em" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#A9AFFF" /><Stop offset="1" stopColor="#5B63E8" />
      </LinearGradient>
    </Defs>
    <G fill="none" stroke="url(#em)" strokeWidth={4} strokeLinecap="round">
      <Path d="M38.5 15A17 17 0 1 0 41 24" />
      <Path d="M17 24h14" />
    </G>
    <Circle cx="38.5" cy="15" r="4.5" fill="#E3E6FF" />
  </Svg>
);

export const Dot = ({ color, size = 8 }: { color: string; size?: number }) => (
  <Svg width={size} height={size}><Rect width={size} height={size} rx={size / 2} fill={color} /></Svg>
);
