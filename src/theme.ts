import type { TextStyle } from 'react-native';
import type { Phase } from './data/plan';

/**
 * Epoch design tokens.
 * The gradient is the environment; the glass is the surface; type is the hierarchy.
 */
export const C = {
  // Base environment (darkest → lighter)
  bg: '#05060A',
  bg1: '#080B12',
  bg2: '#0C1018',

  // Slate, for the few opaque pieces
  slate1: '#111923',
  slate2: '#151F2B',
  slate3: '#1A2532',

  // Ambient light: lives in the background, never on whole surfaces
  deepViolet: '#3B0764',
  violet: '#6D28D9',
  electric: '#7C3AED',
  indigo: '#4F46E5',
  magenta: '#C026D3',
  pink: '#D946EF',

  // Text
  ink: '#F8FAFC', // primary
  ink2: '#C7CBDA', // secondary, soft white
  muted: '#8B90A7', // metadata
  faint: '#626780', // lowest priority

  // Small accents (selected states, progress, indicators)
  accent: '#C4B5FD', // light violet, readable on dark glass
  accentDim: 'rgba(167,139,250,0.20)',
  accentLine: 'rgba(196,181,253,0.45)',

  // White contrast controls
  light: '#F5F7FA',
  onLight: '#0B1017',

  warn: '#F0B37E',
};

/** Glass recipe: blurred background + smoked tint + hairline border + faint top highlight. */
export const GLASS = {
  tint: 'rgba(18,22,38,0.48)',
  tintStrong: 'rgba(16,20,32,0.80)',
  tintSolid: '#0E1120', // inside modals: opaque, since a modal window has nothing behind it to blur
  border: 'rgba(255,255,255,0.10)',
  borderHi: 'rgba(255,255,255,0.16)',
  highlight: 'rgba(255,255,255,0.06)',
  activeFill: 'rgba(255,255,255,0.12)',
  intensity: 38,
};

export const R = { sm: 10, md: 12, card: 18, lg: 22, pill: 999 };
export const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 };

/** Poppins, embedded at build time (one family name per weight on Android). */
export const FONT = {
  400: 'Poppins_400Regular',
  500: 'Poppins_500Medium',
  600: 'Poppins_600SemiBold',
  700: 'Poppins_700Bold',
} as const;

/** Type scale. Hierarchy comes from size and weight; colour stays white-to-grey. */
export const T: Record<'display' | 'heading' | 'title' | 'body' | 'secondary' | 'meta' | 'label', TextStyle> = {
  display: { fontFamily: FONT[700], fontSize: 32, lineHeight: 40, letterSpacing: 1, color: C.ink },
  heading: { fontFamily: FONT[600], fontSize: 26, lineHeight: 34, letterSpacing: -0.4, color: C.ink },
  title: { fontFamily: FONT[600], fontSize: 18, lineHeight: 25, letterSpacing: -0.2, color: C.ink },
  body: { fontFamily: FONT[400], fontSize: 14.5, lineHeight: 22, color: C.ink2 },
  secondary: { fontFamily: FONT[400], fontSize: 13.5, lineHeight: 20, color: C.ink2 },
  meta: { fontFamily: FONT[400], fontSize: 12.5, lineHeight: 18, color: C.muted },
  label: { fontFamily: FONT[500], fontSize: 10.5, lineHeight: 15, letterSpacing: 1.1, color: C.muted },
};

/** Phase colours appear only as small dots. */
export const PHASE_COLOR: Record<Phase, string> = {
  1: '#A5B4FC',
  2: '#C4B5FD',
  3: '#F0ABFC',
  4: '#F9A8D4',
  5: '#93C5FD',
};

/** Progress rings, outer → inner. */
export const RING_COLORS = [
  ['#EDE9FE', '#C4B5FD', '#A78BFA', '#8B5CF6'],
  ['#F5D0FE', '#E879F9', '#C084FC', '#818CF8'],
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
