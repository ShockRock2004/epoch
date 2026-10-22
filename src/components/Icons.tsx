// Hand-drawn 24×24 stroke icons. No icon library.
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';

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

/** Normal mode: a speedometer at a steady pace. */
export const IconGauge = (p: P) => (
  <Svg {...base(p)}>
    <Path d="M4.5 17.5a8.5 8.5 0 1 1 15 0" /><Line x1="12" y1="14" x2="8.6" y2="10" /><Circle cx="12" cy="14" r="1.2" />
  </Svg>
);

/** Hyper mode: a lightning bolt. */
export const IconBolt = (p: P) => (
  <Svg {...base(p)}><Path d="M13.5 2.5 5 13.5h6l-1 8 8.5-11h-6Z" /></Svg>
);

export const IconLock = (p: P) => (
  <Svg {...base(p)}><Rect x="5" y="10.5" width="14" height="10" rx="2" /><Path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></Svg>
);

export const IconChevron = (p: P & { dir?: 'left' | 'right' | 'down' }) => {
  const d = p.dir === 'left' ? 'M15 5l-7 7 7 7' : p.dir === 'down' ? 'M5 9l7 7 7-7' : 'M9 5l7 7-7 7';
  return <Svg {...base(p)}><Path d={d} /></Svg>;
};
