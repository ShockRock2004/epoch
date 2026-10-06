import type { Phase } from './data/plan';

export const C = {
  bg: '#03080B',
  bg2: '#0B3A47',
  ink: '#F2F6FA',
  ink2: '#C6D3DE',
  muted: '#8498A8',
  faint: '#536677',
  line: 'rgba(255,255,255,0.10)',
  line2: 'rgba(255,255,255,0.18)',
  glass: 'rgba(255,255,255,0.06)',
  glassHi: 'rgba(255,255,255,0.10)',
  glassDeep: 'rgba(8,20,30,0.72)',
  accent: '#9CC8FF',
  accent2: '#6EA8F5',
  accentInk: '#08121F',
  accentWash: 'rgba(156,200,255,0.16)',
  good: '#F2F6FA', // 'done' is white; no green anywhere
  goodWash: 'rgba(200,222,255,0.14)',
  warn: '#FFB25C',
};

/** Background: near-black at the top, deep teal at the bottom. */
export const BG_GRADIENT = ['#03070B', '#061722', '#0A2E3B', '#0D4150'] as const;
export const BG_LOCATIONS = [0, 0.38, 0.78, 1] as const;

/** Sora, embedded at build time (one family name per weight on Android). Clean geometric, light-handed. */
export const FONT = {
  400: 'Sora_400Regular',
  500: 'Sora_500Medium',
  600: 'Sora_600SemiBold',
  700: 'Sora_600SemiBold', // Sora runs heavy; semibold reads as bold and stays elegant
  800: 'Sora_700Bold',
  300: 'Sora_300Light',
} as const;

export const PHASE_COLOR: Record<Phase, string> = {
  1: '#7DB4FF',
  2: '#B79CFF',
  3: '#FFA866',
  4: '#FFD36E',
  5: '#FF8DB3',
};

// Ring colours, outer → inner, per cluster (Apple-Fitness-like saturation on navy).
export const RING_COLORS = [
  ['#F2F6FA', '#9CC8FF', '#B79CFF', '#FFD36E'],
  ['#B79CFF', '#FFA866', '#FF8DB3', '#9CC8FF'],
];

export const R = { sm: 10, md: 14, lg: 18, xl: 22, pill: 999 };

export const alpha = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

export const fmtMins = (secs: number) => `${Math.round(secs / 60)} min`;

export const fmtClock = (s: number) => {
  s = Math.round(s);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : String(m)) + ':' + String(x).padStart(2, '0');
};
