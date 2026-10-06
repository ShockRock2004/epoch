import type { Phase } from './data/plan';

export const C = {
  bg: '#0A0E1A',
  bg2: '#141B2E',
  ink: '#F2F4FF',
  ink2: '#C9CEE6',
  muted: '#8A91AD',
  faint: '#545B78',
  line: 'rgba(255,255,255,0.10)',
  line2: 'rgba(255,255,255,0.18)',
  glass: 'rgba(255,255,255,0.06)',
  glassHi: 'rgba(255,255,255,0.10)',
  glassDeep: 'rgba(14,18,34,0.72)',
  accent: '#8B93FF',
  accent2: '#6C74F0',
  accentWash: 'rgba(139,147,255,0.16)',
  good: '#5CE0A0',
  goodWash: 'rgba(92,224,160,0.14)',
  warn: '#FFB25C',
};

export const PHASE_COLOR: Record<Phase, string> = {
  1: '#6FA8FF',
  2: '#B08BFF',
  3: '#FF9F5A',
  4: '#5CE0A0',
  5: '#FF7FA8',
};

// Ring colours, outer → inner, per cluster (Apple-Fitness-like saturation on navy).
export const RING_COLORS = [
  ['#FF4F7B', '#9BFF4F', '#4FD8FF', '#FFC24F'],
  ['#B08BFF', '#FF9F5A', '#5CE0A0', '#FF7FA8'],
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
