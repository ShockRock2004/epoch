import type { TextStyle } from 'react-native';
import type { Phase } from './data/plan';

/**
 * Epoch design tokens. One neutral slate ramp, one accent, and nothing else.
 * Depth comes from tonal steps and thin borders, never from glow.
 */
export const C = {
  // Background → surfaces (each step is one notch lighter)
  bg: '#05070A',
  bg1: '#080C11',
  bg2: '#0D1319',
  card: '#151E27',
  raised: '#1B2630',
  hover: '#202D38',

  border: '#283642',
  border2: '#344452',

  ink: '#F1F5F9', // headings, primary text
  ink2: '#A8B4C0', // secondary text
  muted: '#74818E', // metadata
  faint: '#5E6B77', // lowest-priority metadata

  accent: '#9AA7FF', // the only accent: selection, progress, small indicators
  accentDim: 'rgba(154,167,255,0.14)',
  accentLine: 'rgba(154,167,255,0.38)',

  light: '#E9EDF2', // primary button fill
  onLight: '#0D1319',

  warn: '#D9A066', // used only for the "undo" hold, as a thin edge
};

/** Background: almost black, settling into charcoal. No visible banding. */
export const BG_GRADIENT = ['#05070A', '#080C11', '#0D1319'] as const;
export const BG_LOCATIONS = [0, 0.55, 1] as const;

export const R = { sm: 8, md: 12, card: 16, lg: 20, pill: 999 };
export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 };

/** Sora, embedded at build time (one family per weight on Android). */
export const FONT = {
  300: 'Sora_300Light',
  400: 'Sora_400Regular',
  500: 'Sora_500Medium',
  600: 'Sora_600SemiBold',
  700: 'Sora_600SemiBold',
  800: 'Sora_700Bold',
} as const;

/** Type scale. Hierarchy comes from size and weight; colour stays neutral. */
export const T: Record<'display' | 'title' | 'heading' | 'body' | 'secondary' | 'meta' | 'label', TextStyle> = {
  display: { fontFamily: FONT[600], fontSize: 30, lineHeight: 36, letterSpacing: 1.5, color: C.ink },
  title: { fontFamily: FONT[600], fontSize: 19, lineHeight: 25, letterSpacing: -0.3, color: C.ink },
  heading: { fontFamily: FONT[600], fontSize: 24, lineHeight: 30, letterSpacing: -0.6, color: C.ink },
  body: { fontFamily: FONT[400], fontSize: 14.5, lineHeight: 22, color: C.ink2 },
  secondary: { fontFamily: FONT[400], fontSize: 13.5, lineHeight: 19, color: C.ink2 },
  meta: { fontFamily: FONT[400], fontSize: 12.5, lineHeight: 17, color: C.muted },
  label: { fontFamily: FONT[500], fontSize: 10.5, lineHeight: 14, letterSpacing: 1.2, color: C.muted },
};

/** Phase colours survive only as small dots, and are muted to sit in the slate palette. */
export const PHASE_COLOR: Record<Phase, string> = {
  1: '#8FA6D6',
  2: '#A89BD4',
  3: '#C9A27F',
  4: '#C2B47E',
  5: '#C996AE',
};

/** Progress rings: one hue at four lightnesses, outer → inner. */
export const RING_COLORS = [
  ['#C9D0FF', '#9AA7FF', '#7884D9', '#5A64AE'],
  ['#C9D0FF', '#9AA7FF', '#7884D9', '#5A64AE'],
];

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
