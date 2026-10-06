// Hand-built topic illustrations: glossy spheres, glass panels and thin links on a 300×220 canvas.
import React from 'react';
import Svg, { Defs, RadialGradient, LinearGradient, Stop, Circle, Ellipse, Line, Path, Rect, G } from 'react-native-svg';
import type { TopicKey } from '../../data/plan';

type Hue = 'blue' | 'violet' | 'grey' | 'green' | 'orange' | 'pink' | 'cyan';
const HUES: Record<Hue, [string, string, string]> = {
  blue: ['#BFD3FF', '#4C6EF0', '#16215E'],
  violet: ['#DCCBFF', '#8457F0', '#2B1763'],
  grey: ['#E2E5F2', '#7A8099', '#272B3D'],
  green: ['#C9FFE6', '#2FBF86', '#0B3D2C'],
  orange: ['#FFE0C2', '#F08A3C', '#5A2508'],
  pink: ['#FFD0E0', '#E8517F', '#5A0F2A'],
  cyan: ['#CBF6FF', '#2CB4E0', '#08394D'],
};

const LINK = 'rgba(190,200,255,0.42)';
const GLASS = 'rgba(255,255,255,0.08)';
const GLASS_EDGE = 'rgba(255,255,255,0.28)';

function Defsets() {
  return (
    <Defs>
      {(Object.keys(HUES) as Hue[]).map(h => (
        <RadialGradient key={h} id={`b-${h}`} cx="0.36" cy="0.32" r="0.72" fx="0.32" fy="0.28">
          <Stop offset="0" stopColor={HUES[h][0]} />
          <Stop offset="0.45" stopColor={HUES[h][1]} />
          <Stop offset="1" stopColor={HUES[h][2]} />
        </RadialGradient>
      ))}
      <RadialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
        <Stop offset="0" stopColor="#7C86FF" stopOpacity="0.35" />
        <Stop offset="1" stopColor="#7C86FF" stopOpacity="0" />
      </RadialGradient>
      <LinearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.16" />
        <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.03" />
      </LinearGradient>
      <LinearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
        <Stop offset="0" stopColor="#8B93FF" stopOpacity="0" />
        <Stop offset="0.5" stopColor="#A9B0FF" stopOpacity="1" />
        <Stop offset="1" stopColor="#8B93FF" stopOpacity="0" />
      </LinearGradient>
      <LinearGradient id="bell" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#8B93FF" stopOpacity="0.55" />
        <Stop offset="1" stopColor="#8B93FF" stopOpacity="0" />
      </LinearGradient>
    </Defs>
  );
}

/** A glossy sphere with a soft drop shadow and a specular highlight. */
const B = ({ x, y, r, h = 'blue' }: { x: number; y: number; r: number; h?: Hue }) => (
  <G>
    <Ellipse cx={x + r * 0.15} cy={y + r * 1.05} rx={r * 0.8} ry={r * 0.18} fill="#000" opacity={0.28} />
    <Circle cx={x} cy={y} r={r} fill={`url(#b-${h})`} />
    <Ellipse cx={x - r * 0.32} cy={y - r * 0.38} rx={r * 0.32} ry={r * 0.2} fill="#fff" opacity={0.55} transform={`rotate(-30 ${x - r * 0.32} ${y - r * 0.38})`} />
  </G>
);

const L = ({ a, b, w = 2.2, o = 1 }: { a: [number, number]; b: [number, number]; w?: number; o?: number }) => (
  <Line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={LINK} strokeWidth={w} strokeLinecap="round" opacity={o} />
);

const Panel = ({ x, y, w, h, r = 12 }: { x: number; y: number; w: number; h: number; r?: number }) => (
  <Rect x={x} y={y} width={w} height={h} rx={r} fill="url(#panel)" stroke={GLASS_EDGE} strokeWidth={1.2} />
);

const links = (pts: [number, number][], pairs: [number, number][], w?: number) =>
  pairs.map(([i, j], k) => <L key={k} a={pts[i]} b={pts[j]} w={w} />);

const ART: Record<TopicKey, () => React.ReactElement> = {
  fundamentals: () => {
    return (
      <G>
        {[78, 56, 34].map((r, i) => <Circle key={r} cx={150} cy={112} r={r} fill={i === 2 ? GLASS : 'none'} stroke={GLASS_EDGE} strokeWidth={1.4} />)}
        <B x={146} y={106} r={13} h="blue" />
        <B x={168} y={122} r={9} h="violet" />
        <B x={132} y={128} r={8} h="blue" />
        <B x={204} y={74} r={11} h="grey" />
        <B x={96} y={160} r={9} h="grey" />
      </G>
    );
  },
  metrics: () => (
    <G>
      <Panel x={88} y={38} w={60} h={60} /><Panel x={154} y={38} w={60} h={60} />
      <Panel x={88} y={104} w={60} h={60} /><Panel x={154} y={104} w={60} h={60} />
      <B x={118} y={68} r={20} h="green" />
      <B x={184} y={134} r={20} h="green" />
      <B x={184} y={68} r={9} h="pink" />
      <B x={118} y={134} r={7} h="pink" />
    </G>
  ),
  regression: () => {
    const pts: [number, number][] = [[70, 170], [100, 150], [124, 152], [150, 118], [176, 112], [204, 88], [232, 72]];
    return (
      <G>
        <L a={[56, 188]} b={[250, 188]} w={1.4} o={0.6} /><L a={[56, 188]} b={[56, 40]} w={1.4} o={0.6} />
        <Line x1={58} y1={182} x2={250} y2={58} stroke="url(#beam)" strokeWidth={3} />
        {pts.map(([x, y], i) => <B key={i} x={x} y={y} r={i % 2 ? 10 : 12} h={i % 3 === 0 ? 'violet' : 'blue'} />)}
      </G>
    );
  },
  'gradient-descent': () => (
    <G>
      <Path d="M40 60 C 90 200, 210 200, 260 60" stroke={GLASS_EDGE} strokeWidth={2} fill="url(#bell)" />
      {[[82, 112], [104, 140], [124, 156], [140, 163]].map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={3 - i * 0.4} fill="#A9B0FF" opacity={0.4 + i * 0.15} />)}
      <B x={66} y={84} r={15} h="orange" />
      <B x={150} y={152} r={10} h="green" />
    </G>
  ),
  regularization: () => (
    <G>
      <Circle cx={150} cy={112} r={62} fill={GLASS} stroke={GLASS_EDGE} strokeWidth={1.4} />
      <Path d="M150 46 L216 112 L150 178 L84 112 Z" fill="none" stroke="#A9B0FF" strokeWidth={2} opacity={0.8} />
      <L a={[60, 112]} b={[240, 112]} w={1.2} o={0.5} /><L a={[150, 30]} b={[150, 196]} w={1.2} o={0.5} />
      <B x={150} y={46} r={14} h="violet" />
      <B x={194} y={68} r={10} h="blue" />
    </G>
  ),
  probability: () => (
    <G>
      <Path d="M40 186 C 100 186, 115 52, 150 52 C 185 52, 200 186, 260 186 Z" fill="url(#bell)" stroke="#A9B0FF" strokeWidth={2} />
      <L a={[40, 187]} b={[260, 187]} w={1.4} o={0.6} />
      <B x={150} y={40} r={15} h="blue" />
      <B x={98} y={150} r={8} h="grey" /><B x={204} y={150} r={8} h="grey" />
    </G>
  ),
  trees: () => {
    const p: [number, number][] = [[150, 40], [100, 100], [200, 100], [72, 168], [126, 168], [176, 168], [228, 168]];
    return (
      <G>
        {links(p, [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]])}
        <B x={p[0][0]} y={p[0][1]} r={18} h="blue" />
        <B x={p[1][0]} y={p[1][1]} r={14} h="violet" /><B x={p[2][0]} y={p[2][1]} r={14} h="violet" />
        <B x={p[3][0]} y={p[3][1]} r={11} h="green" /><B x={p[4][0]} y={p[4][1]} r={11} h="pink" />
        <B x={p[5][0]} y={p[5][1]} r={11} h="green" /><B x={p[6][0]} y={p[6][1]} r={11} h="green" />
      </G>
    );
  },
  ensembles: () => {
    const tree = (cx: number, cy: number, s: number, h: Hue) => {
      const p: [number, number][] = [[cx, cy], [cx - 22 * s, cy + 40 * s], [cx + 22 * s, cy + 40 * s]];
      return (
        <G>
          {links(p, [[0, 1], [0, 2]], 1.8)}
          <B x={p[0][0]} y={p[0][1]} r={12 * s} h={h} /><B x={p[1][0]} y={p[1][1]} r={8 * s} h="grey" /><B x={p[2][0]} y={p[2][1]} r={8 * s} h="grey" />
        </G>
      );
    };
    return (
      <G>
        {tree(80, 70, 1, 'violet')}{tree(150, 52, 1.2, 'blue')}{tree(220, 70, 1, 'violet')}
        <Path d="M80 140 Q 150 196 220 140" stroke={LINK} strokeWidth={2} fill="none" strokeDasharray="4 6" />
        <B x={150} y={176} r={16} h="green" />
      </G>
    );
  },
  svm: () => (
    <G>
      <Line x1={92} y1={196} x2={214} y2={28} stroke="url(#beam)" strokeWidth={3} />
      <Line x1={62} y1={180} x2={184} y2={12} stroke={LINK} strokeWidth={1.5} strokeDasharray="5 6" />
      <Line x1={122} y1={210} x2={244} y2={42} stroke={LINK} strokeWidth={1.5} strokeDasharray="5 6" />
      {[[70, 70], [98, 110], [60, 130], [116, 66]].map(([x, y], i) => <B key={i} x={x} y={y} r={11} h="blue" />)}
      {[[200, 140], [238, 112], [226, 172], [186, 186]].map(([x, y], i) => <B key={i} x={x} y={y} r={11} h="orange" />)}
    </G>
  ),
  clustering: () => {
    const cl = (cx: number, cy: number, h: Hue) => (
      <G>
        <Circle cx={cx} cy={cy} r={38} fill={GLASS} stroke={GLASS_EDGE} strokeWidth={1} />
        <B x={cx - 12} y={cy - 8} r={11} h={h} /><B x={cx + 12} y={cy - 4} r={9} h={h} /><B x={cx} y={cy + 14} r={10} h={h} />
      </G>
    );
    return <G>{cl(90, 76, 'blue')}{cl(208, 86, 'violet')}{cl(148, 164, 'green')}</G>;
  },
  pca: () => {
    const pts: [number, number][] = [[90, 150], [110, 132], [128, 128], [140, 112], [160, 104], [178, 92], [198, 80], [214, 66], [120, 112], [180, 112]];
    return (
      <G>
        <Ellipse cx={152} cy={110} rx={92} ry={36} fill={GLASS} stroke={GLASS_EDGE} transform="rotate(-30 152 110)" />
        <Line x1={152} y1={110} x2={236} y2={62} stroke="#A9B0FF" strokeWidth={3} strokeLinecap="round" />
        <Line x1={152} y1={110} x2={170} y2={142} stroke="#FF9F5A" strokeWidth={3} strokeLinecap="round" />
        {pts.map(([x, y], i) => <B key={i} x={x} y={y} r={7} h={i % 2 ? 'blue' : 'violet'} />)}
      </G>
    );
  },
  'neural-net': () => {
    const L1: [number, number][] = [[70, 62], [70, 112], [70, 162]];
    const L2: [number, number][] = [[150, 40], [150, 88], [150, 136], [150, 184]];
    const L3: [number, number][] = [[230, 86], [230, 138]];
    return (
      <G>
        {L1.flatMap((a, i) => L2.map((b, j) => <L key={`a${i}${j}`} a={a} b={b} w={1.4} o={0.7} />))}
        {L2.flatMap((a, i) => L3.map((b, j) => <L key={`b${i}${j}`} a={a} b={b} w={1.4} o={0.7} />))}
        {L1.map(([x, y], i) => <B key={`x${i}`} x={x} y={y} r={13} h="grey" />)}
        {L2.map(([x, y], i) => <B key={`h${i}`} x={x} y={y} r={14} h="blue" />)}
        {L3.map(([x, y], i) => <B key={`o${i}`} x={x} y={y} r={15} h="violet" />)}
      </G>
    );
  },
  optimizers: () => (
    <G>
      {[90, 66, 42, 20].map((r, i) => <Ellipse key={r} cx={160} cy={112} rx={r * 1.35} ry={r * 0.8} fill={i === 3 ? GLASS : 'none'} stroke={GLASS_EDGE} strokeWidth={1.2} />)}
      <Path d="M48 60 L84 150 L110 74 L128 138 L142 96 L152 120 L160 112" stroke="#FF9F5A" strokeWidth={2} fill="none" strokeLinejoin="round" opacity={0.9} />
      <B x={48} y={60} r={10} h="orange" />
      <B x={160} y={112} r={14} h="green" />
    </G>
  ),
  cnn: () => (
    <G>
      {[0, 1, 2].map(i => (
        <G key={i} transform={`translate(${60 + i * 46} ${54 - i * 10}) skewY(-12)`}>
          <Rect width={86 - i * 18} height={86 - i * 18} rx={8} fill="url(#panel)" stroke={GLASS_EDGE} />
          {[1, 2].map(k => <Line key={`v${k}`} x1={(k * (86 - i * 18)) / 3} y1={0} x2={(k * (86 - i * 18)) / 3} y2={86 - i * 18} stroke={GLASS_EDGE} strokeWidth={0.8} />)}
          {[1, 2].map(k => <Line key={`h${k}`} x1={0} y1={(k * (86 - i * 18)) / 3} x2={86 - i * 18} y2={(k * (86 - i * 18)) / 3} stroke={GLASS_EDGE} strokeWidth={0.8} />)}
        </G>
      ))}
      <B x={86} y={92} r={10} h="cyan" />
      <B x={236} y={84} r={16} h="violet" />
    </G>
  ),
  rnn: () => {
    const xs = [60, 120, 180, 240];
    return (
      <G>
        {xs.slice(0, -1).map((x, i) => <L key={i} a={[x, 130]} b={[xs[i + 1], 130]} w={2.4} />)}
        {xs.map((x, i) => <Path key={`l${i}`} d={`M${x - 10} 112 C ${x - 26} 64, ${x + 26} 64, ${x + 10} 112`} stroke="#A9B0FF" strokeWidth={2} fill="none" opacity={0.75} />)}
        {xs.map((x, i) => <B key={`b${i}`} x={x} y={130} r={17} h={i === 3 ? 'violet' : 'blue'} />)}
        {xs.map((x, i) => <B key={`t${i}`} x={x} y={188} r={7} h="grey" />)}
      </G>
    );
  },
  embeddings: () => (
    <G>
      <L a={[70, 180]} b={[250, 180]} w={1.4} o={0.6} /><L a={[70, 180]} b={[70, 30]} w={1.4} o={0.6} /><L a={[70, 180]} b={[30, 210]} w={1.4} o={0.6} />
      <Path d="M108 140 L196 140 L226 66 L138 66 Z" fill={GLASS} stroke="#A9B0FF" strokeWidth={1.6} strokeDasharray="5 5" />
      <B x={108} y={140} r={13} h="blue" /><B x={196} y={140} r={13} h="pink" />
      <B x={138} y={66} r={13} h="blue" /><B x={226} y={66} r={13} h="pink" />
    </G>
  ),
  attention: () => {
    const top: [number, number][] = [[50, 56], [100, 56], [150, 56], [200, 56], [250, 56]];
    const w = [1.2, 4.5, 2, 6, 1.2];
    return (
      <G>
        {top.map((p, i) => <L key={i} a={p} b={[150, 172]} w={w[i]} o={0.25 + w[i] / 8} />)}
        {top.map(([x, y], i) => <B key={`t${i}`} x={x} y={y} r={8 + w[i] * 1.4} h={w[i] > 4 ? 'violet' : 'blue'} />)}
        <B x={150} y={172} r={20} h="orange" />
      </G>
    );
  },
  transformer: () => (
    <G>
      {[0, 1, 2].map(i => <Panel key={i} x={90} y={142 - i * 46} w={120} h={36} r={10} />)}
      {[0, 1].map(i => <L key={i} a={[150, 142 - i * 46]} b={[150, 132 - i * 46]} w={2} />)}
      {[110, 130, 150, 170, 190].map((x, i) => <B key={i} x={x} y={200} r={6} h="grey" />)}
      <B x={150} y={30} r={14} h="violet" />
      <B x={232} y={66} r={9} h="blue" /><B x={68} y={110} r={9} h="blue" />
    </G>
  ),
  'llm-training': () => (
    <G>
      <Ellipse cx={150} cy={110} rx={118} ry={34} fill="none" stroke={GLASS_EDGE} strokeWidth={1.4} transform="rotate(-14 150 110)" />
      <Circle cx={150} cy={110} r={64} fill="url(#glow)" />
      <B x={150} y={110} r={42} h="blue" />
      <B x={40} y={140} r={9} h="violet" /><B x={262} y={80} r={11} h="violet" />
      {[0, 1, 2].map(i => <Panel key={i} x={186 + i * 26} y={168 - i * 10} w={20} h={20} r={5} />)}
    </G>
  ),
  rlhf: () => (
    <G>
      <Panel x={64} y={74} w={74} h={96} /><Panel x={162} y={74} w={74} h={96} />
      <B x={101} y={112} r={18} h="grey" />
      <B x={199} y={112} r={18} h="green" />
      <Path d="M199 30 l7 14 15 2 -11 10 3 15 -14 -7 -14 7 3 -15 -11 -10 15 -2 Z" fill="#FFC24F" opacity={0.92} />
      <Rect x={74} y={154} width={54} height={6} rx={3} fill="rgba(255,255,255,0.15)" />
      <Rect x={172} y={154} width={54} height={6} rx={3} fill="#5CE0A0" />
    </G>
  ),
  rag: () => (
    <G>
      <Panel x={44} y={46} w={88} h={118} />
      {[70, 86, 102, 118, 134].map((y, i) => <Rect key={y} x={58} y={y} width={i % 2 ? 46 : 60} height={5} rx={2.5} fill="rgba(255,255,255,0.3)" />)}
      <Ellipse cx={230} cy={64} rx={36} ry={11} fill="url(#panel)" stroke={GLASS_EDGE} />
      <Path d="M194 64 v80 a36 11 0 0 0 72 0 v-80" fill="url(#panel)" stroke={GLASS_EDGE} />
      <Path d="M194 96 a36 11 0 0 0 72 0 M194 120 a36 11 0 0 0 72 0" fill="none" stroke={GLASS_EDGE} />
      <L a={[132, 104]} b={[194, 104]} w={2} />
      <B x={162} y={104} r={15} h="violet" />
      <B x={150} y={192} r={12} h="blue" />
    </G>
  ),
  'fine-tuning': () => (
    <G>
      <Panel x={46} y={48} w={116} h={116} />
      {[1, 2, 3].map(k => <Line key={`v${k}`} x1={46 + k * 29} y1={48} x2={46 + k * 29} y2={164} stroke={GLASS_EDGE} strokeWidth={0.8} />)}
      {[1, 2, 3].map(k => <Line key={`h${k}`} x1={46} y1={48 + k * 29} x2={162} y2={48 + k * 29} stroke={GLASS_EDGE} strokeWidth={0.8} />)}
      <Rect x={186} y={48} width={18} height={116} rx={8} fill="rgba(139,147,255,0.35)" stroke="#A9B0FF" />
      <Rect x={214} y={96} width={58} height={18} rx={8} fill="rgba(255,159,90,0.35)" stroke="#FF9F5A" />
      <B x={104} y={106} r={22} h="blue" />
      <B x={195} y={188} r={9} h="violet" /><B x={243} y={140} r={9} h="orange" />
    </G>
  ),
  agents: () => {
    const orbit: [number, number][] = [[52, 104], [118, 46], [222, 54], [250, 140], [150, 186]];
    const hue: Hue[] = ['green', 'orange', 'pink', 'cyan', 'violet'];
    return (
      <G>
        <Ellipse cx={150} cy={114} rx={104} ry={64} fill="none" stroke={GLASS_EDGE} strokeWidth={1.3} strokeDasharray="4 6" />
        {orbit.map((p, i) => <L key={i} a={[150, 114]} b={p} w={1.4} o={0.55} />)}
        <B x={150} y={114} r={28} h="blue" />
        {orbit.map(([x, y], i) => <B key={`o${i}`} x={x} y={y} r={11} h={hue[i]} />)}
      </G>
    );
  },
  evals: () => (
    <G>
      <Panel x={50} y={40} w={110} h={140} />
      {[70, 108, 146].map((y, i) => (
        <G key={y}>
          <Circle cx={74} cy={y} r={9} fill={i === 2 ? 'none' : '#5CE0A0'} stroke={i === 2 ? GLASS_EDGE : 'none'} />
          {i < 2 && <Path d={`M69 ${y} l4 4 7 -8`} stroke="#0A0E1A" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
          <Rect x={92} y={y - 3} width={52} height={6} rx={3} fill="rgba(255,255,255,0.3)" />
        </G>
      ))}
      <Path d="M186 160 A 46 46 0 0 1 278 160" stroke="rgba(255,255,255,0.15)" strokeWidth={10} fill="none" strokeLinecap="round" />
      <Path d="M186 160 A 46 46 0 0 1 258 124" stroke="#8B93FF" strokeWidth={10} fill="none" strokeLinecap="round" />
      <B x={232} y={152} r={12} h="violet" />
    </G>
  ),
  prompting: () => (
    <G>
      <Path d="M54 50 h150 a14 14 0 0 1 14 14 v62 a14 14 0 0 1 -14 14 h-110 l-26 22 v-22 h-14 a14 14 0 0 1 -14 -14 v-62 a14 14 0 0 1 14 -14 Z" fill="url(#panel)" stroke={GLASS_EDGE} strokeWidth={1.2} />
      {[74, 94, 114].map((y, i) => <Rect key={y} x={66} y={y} width={i === 2 ? 70 : 120} height={6} rx={3} fill="rgba(255,255,255,0.32)" />)}
      <B x={246} y={150} r={20} h="violet" />
      <B x={226} y={60} r={9} h="blue" />
    </G>
  ),
  review: () => (
    <G>
      <Circle cx={150} cy={110} r={70} fill="url(#panel)" stroke={GLASS_EDGE} strokeWidth={1.2} />
      <Path d="M126 92 a24 24 0 1 1 34 22 c-8 4 -10 9 -10 18" stroke="#C9CEFF" strokeWidth={10} fill="none" strokeLinecap="round" />
      <B x={150} y={156} r={8} h="violet" />
      <B x={60} y={58} r={11} h="blue" /><B x={246} y={160} r={13} h="green" /><B x={238} y={52} r={7} h="pink" />
    </G>
  ),
};

export const TOPIC_LABEL: Record<TopicKey, string> = {
  fundamentals: 'Foundations', metrics: 'Metrics', regression: 'Regression', 'gradient-descent': 'Gradient descent',
  regularization: 'Regularisation', probability: 'Probability', trees: 'Decision trees', ensembles: 'Ensembles',
  svm: 'Support vectors', clustering: 'Clustering', pca: 'Dimensionality', 'neural-net': 'Neural networks',
  optimizers: 'Optimisation', cnn: 'Convolutions', rnn: 'Sequences', embeddings: 'Embeddings', attention: 'Attention',
  transformer: 'Transformers', 'llm-training': 'Training LLMs', rlhf: 'Alignment', rag: 'Retrieval', 'fine-tuning': 'Fine-tuning',
  agents: 'Agents', evals: 'Evaluation', prompting: 'Prompting', review: 'Checkpoint',
};

export function TopicArt({ topic, width = 300 }: { topic: TopicKey; width?: number }) {
  const Art = ART[topic];
  return (
    <Svg width={width} height={(width * 220) / 300} viewBox="0 0 300 220">
      <Defsets />
      <Ellipse cx={150} cy={112} rx={140} ry={100} fill="url(#glow)" />
      <Art />
    </Svg>
  );
}
