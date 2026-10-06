import type { TextStyle } from 'react-native';
import type { Phase } from './data/plan';

/**
 * Epoch design tokens.
 * A near-black screen with a mild violet glow at the top, real blurred glass surfaces,
 * and magenta-to-violet only as accent. White type does the talking.
 */
export const C = {
  bg: '#050407',
  bg1: '#09070D',
  bg2: '#0E0B14',

  // Light in the environment
  deepViolet: '#3B0A6E',
  violet: '#6A1BC2',
  electric: '#8A2BE2',
  indigo: '#4C1D95',
  magenta: '#C026D3',
  pink: '#D946EF',

  // Text
  ink: '#FFFFFF',
  ink2: '#D9CCEB', // soft lavender white
  muted: '#9B8BB4', // metadata
  faint: '#6E5F86',

  // Accents
  accent: '#C77DFF', // magenta-violet, like the reference greeting
  label: '#A970F0', // small uppercase field labels
  accentDim: 'rgba(192,38,211,0.18)',
  accentLine: 'rgba(199,125,255,0.45)',

  // Controls
  light: '#FFFFFF',
  onLight: '#2A0A4A',
  black: '#050308',

  warn: '#F2B37E',
};

/** The signature gradient: magenta → violet → deep purple, left to right. */
export const GRAD = ['#D13BF0', '#8E2DE2', '#4A0E8F'] as const;

/** Glass: real expo-blur over the environment, a smoked tint, a white hairline and a faint top sheen. */
export const GLASS = {
  tint: 'rgba(22,19,30,0.50)',
  tintSolid: '#110D18', // modals: a separate window, nothing behind to blur
  field: 'rgba(255,255,255,0.05)', // input-like rows inside glass
  border: 'rgba(255,255,255,0.10)',
  borderHi: 'rgba(255,255,255,0.18)',
  highlight: 'rgba(255,255,255,0.07)',
  activeFill: '#FFFFFF',
  intensity: 45,
};

export const R = { sm: 8, md: 10, card: 14, lg: 18, pill: 999 };
export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 };

/** Sora, embedded at build time (one family name per weight on Android). */
export const FONT = {
  400: 'Sora_400Regular',
  500: 'Sora_500Medium',
  600: 'Sora_600SemiBold',
  700: 'Sora_700Bold',
  800: 'Sora_800ExtraBold',
} as const;

/** Type scale, modelled on the reference: magenta greeting, heavy white headline, tracked caps. */
export const T: Record<'display' | 'heading' | 'title' | 'body' | 'secondary' | 'meta' | 'label' | 'greeting', TextStyle> = {
  greeting: { fontFamily: FONT[600], fontSize: 14, lineHeight: 20, color: C.accent },
  display: { fontFamily: FONT[700], fontSize: 31, lineHeight: 38, letterSpacing: 0.5, color: C.ink },
  heading: { fontFamily: FONT[800], fontSize: 26, lineHeight: 32, letterSpacing: 0.2, color: C.ink },
  title: { fontFamily: FONT[600], fontSize: 17, lineHeight: 24, color: C.ink },
  body: { fontFamily: FONT[500], fontSize: 14, lineHeight: 21, color: C.ink2 },
  secondary: { fontFamily: FONT[500], fontSize: 13, lineHeight: 19, color: C.ink2 },
  meta: { fontFamily: FONT[500], fontSize: 12, lineHeight: 17, color: C.muted },
  label: { fontFamily: FONT[600], fontSize: 9.5, lineHeight: 14, letterSpacing: 1.4, color: C.label },
};

/** Phase colours appear only as small dots. */
export const PHASE_COLOR: Record<Phase, string> = {
  1: '#E879F9',
  2: '#C084FC',
  3: '#A78BFA',
  4: '#F0ABFC',
  5: '#818CF8',
};

/** Apple-Watch-style rings, outer → inner: vivid, distinct, no green. */
export const RING_COLORS = [
  ['#FF375F', '#E040FB', '#9D7BFF', '#5E9EFF'],
  ['#FF375F', '#E040FB', '#9D7BFF', '#5E9EFF'],
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
