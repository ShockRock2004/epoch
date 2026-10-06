import type { TextStyle } from 'react-native';
import type { Phase } from './data/plan';

/**
 * Epoch design tokens.
 * A black screen lit violet from the top, dark purple panels, and magenta-to-violet
 * gradient controls. White type does the talking; small uppercase labels carry structure.
 */
export const C = {
  bg: '#07040C',
  bg1: '#0C0716',
  bg2: '#120A20',

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

/** Panels: dark purple surfaces with a hairline violet edge and a soft shadow. */
export const GLASS = {
  panel: ['#1F1036', '#140A25'] as const, // top → bottom
  tintSolid: '#140A24',
  field: 'rgba(0,0,0,0.36)', // input-like rows inside panels
  border: 'rgba(199,125,255,0.14)',
  borderHi: 'rgba(199,125,255,0.28)',
  highlight: 'rgba(255,255,255,0.05)',
  activeFill: '#FFFFFF',
};

export const R = { sm: 8, md: 10, card: 14, lg: 18, pill: 999 };
export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 };

/** Montserrat, embedded at build time (one family name per weight on Android). */
export const FONT = {
  400: 'Montserrat_400Regular',
  500: 'Montserrat_500Medium',
  600: 'Montserrat_600SemiBold',
  700: 'Montserrat_700Bold',
  800: 'Montserrat_800ExtraBold',
} as const;

/** Type scale, modelled on the reference: magenta greeting, heavy white headline, tracked caps. */
export const T: Record<'display' | 'heading' | 'title' | 'body' | 'secondary' | 'meta' | 'label' | 'greeting', TextStyle> = {
  greeting: { fontFamily: FONT[700], fontSize: 15, lineHeight: 20, color: C.accent },
  display: { fontFamily: FONT[800], fontSize: 34, lineHeight: 41, letterSpacing: 0.5, color: C.ink },
  heading: { fontFamily: FONT[800], fontSize: 26, lineHeight: 32, letterSpacing: 0.2, color: C.ink },
  title: { fontFamily: FONT[700], fontSize: 17.5, lineHeight: 24, color: C.ink },
  body: { fontFamily: FONT[500], fontSize: 14, lineHeight: 21, color: C.ink2 },
  secondary: { fontFamily: FONT[500], fontSize: 13, lineHeight: 19, color: C.ink2 },
  meta: { fontFamily: FONT[500], fontSize: 12, lineHeight: 17, color: C.muted },
  label: { fontFamily: FONT[700], fontSize: 9.5, lineHeight: 14, letterSpacing: 1.6, color: C.label },
};

/** Phase colours appear only as small dots. */
export const PHASE_COLOR: Record<Phase, string> = {
  1: '#E879F9',
  2: '#C084FC',
  3: '#A78BFA',
  4: '#F0ABFC',
  5: '#818CF8',
};

/** Ring / bar colours: all from the one magenta-violet family. */
export const RING_COLORS = [
  ['#E879F9', '#C77DFF', '#A855F7', '#7C3AED'],
  ['#F0ABFC', '#D946EF', '#9333EA', '#6D28D9'],
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
