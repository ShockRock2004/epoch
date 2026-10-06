// Hand-drawn topic glyphs: one clean line icon per topic on a 64-unit grid,
// shown inside a glass orb. Strokes are white; small dots take the light-violet accent.
import React from 'react';
import { View } from 'react-native';
import { Glass } from '../Glass';
import Svg, { Defs, RadialGradient, LinearGradient, Stop, Circle, Ellipse, Line, Path, Rect, G } from 'react-native-svg';
import type { TopicKey } from '../../data/plan';

const DOT = (x: number, y: number, r = 2.2) => <Circle cx={x} cy={y} r={r} fill="url(#ink)" stroke="none" />;

const GLYPH: Record<TopicKey, React.ReactElement> = {
  fundamentals: (
    <G>
      <Circle cx={32} cy={32} r={22} /><Circle cx={32} cy={32} r={13} />
      {DOT(32, 32, 3.4)}{DOT(37, 27)}{DOT(27, 36)}{DOT(46, 18)}
    </G>
  ),
  metrics: (
    <G>
      <Rect x={10} y={10} width={44} height={44} rx={7} />
      <Line x1={32} y1={10} x2={32} y2={54} /><Line x1={10} y1={32} x2={54} y2={32} />
      <Path d="M15 21l4 4 7-8" /><Path d="M37 43l4 4 7-8" />
      <Path d="M39 17l7 7M46 17l-7 7" opacity={0.55} />
    </G>
  ),
  regression: (
    <G>
      <Path d="M10 10v44h44" />
      <Line x1={14} y1={48} x2={54} y2={16} />
      {DOT(19, 40)}{DOT(26, 38)}{DOT(31, 31)}{DOT(38, 30)}{DOT(44, 22)}{DOT(50, 21)}
    </G>
  ),
  'gradient-descent': (
    <G>
      <Path d="M8 14c6 34 42 34 48 0" />
      <Circle cx={13} cy={22} r={4} />
      <Path d="M19 33q4 6 9 8" strokeDasharray="1 5" />
      {DOT(32, 39.5, 3.2)}
    </G>
  ),
  regularization: (
    <G>
      <Circle cx={32} cy={32} r={20} />
      <Path d="M32 10l22 22-22 22-22-22Z" />
      {DOT(32, 10, 3.2)}
    </G>
  ),
  probability: (
    <G>
      <Path d="M6 52c12 0 15-36 26-36s14 36 26 36" />
      <Line x1={6} y1={52} x2={58} y2={52} />
      <Line x1={32} y1={16} x2={32} y2={52} strokeDasharray="2 4" />
    </G>
  ),
  trees: (
    <G>
      <Circle cx={32} cy={12} r={5} />
      <Path d="M28 16l-10 12M36 16l10 12" />
      <Circle cx={17} cy={32} r={4.5} /><Circle cx={47} cy={32} r={4.5} />
      <Path d="M14 36l-5 10M20 36l5 10M44 36l-5 10M50 36l5 10" />
      {DOT(9, 50)}{DOT(25, 50)}{DOT(39, 50)}{DOT(55, 50)}
    </G>
  ),
  ensembles: (
    <G>
      {[12, 32, 52].map((x, i) => (
        <G key={x} transform={`translate(0 ${i === 1 ? -4 : 2})`}>
          <Circle cx={x} cy={22} r={4} />
          <Path d={`M${x - 3} 25.5l-4 9M${x + 3} 25.5l4 9`} />
          {DOT(x - 7.5, 37.5, 1.8)}{DOT(x + 7.5, 37.5, 1.8)}
        </G>
      ))}
      <Path d="M12 46q20 12 40 0" />
      {DOT(32, 52, 3)}
    </G>
  ),
  svm: (
    <G>
      <Line x1={16} y1={58} x2={48} y2={6} />
      <Line x1={6} y1={52} x2={38} y2={0} strokeDasharray="2 4" opacity={0.6} />
      <Line x1={26} y1={64} x2={58} y2={12} strokeDasharray="2 4" opacity={0.6} />
      <Circle cx={14} cy={20} r={3.4} /><Circle cx={22} cy={13} r={3.4} /><Circle cx={11} cy={31} r={3.4} />
      {DOT(46, 44, 3.4)}{DOT(52, 34, 3.4)}{DOT(40, 53, 3.4)}
    </G>
  ),
  clustering: (
    <G>
      <Circle cx={19} cy={20} r={11} strokeDasharray="3 4" />
      <Circle cx={45} cy={24} r={10} strokeDasharray="3 4" />
      <Circle cx={30} cy={46} r={11} strokeDasharray="3 4" />
      {DOT(16, 18)}{DOT(22, 23)}{DOT(43, 22)}{DOT(47, 27)}{DOT(27, 44)}{DOT(33, 49)}
    </G>
  ),
  pca: (
    <G>
      <Ellipse cx={32} cy={32} rx={26} ry={11} transform="rotate(-32 32 32)" />
      <Path d="M32 32l18-11M45 19.5l5 1.5-1.5 5" />
      <Path d="M32 32l6 9" />
      {DOT(32, 32, 2.8)}
    </G>
  ),
  'neural-net': (
    <G>
      {[[10, 18], [10, 32], [10, 46]].flatMap(([x, y]) => [[32, 12], [32, 32], [32, 52]].map(([u, v]) => <Line key={`${x}${y}${u}${v}`} x1={x} y1={y} x2={u} y2={v} opacity={0.45} />))}
      {[[32, 12], [32, 32], [32, 52]].flatMap(([x, y]) => [[54, 24], [54, 40]].map(([u, v]) => <Line key={`b${x}${y}${u}${v}`} x1={x} y1={y} x2={u} y2={v} opacity={0.45} />))}
      {[[10, 18], [10, 32], [10, 46], [32, 12], [32, 32], [32, 52], [54, 24], [54, 40]].map(([x, y]) => (
        <Circle key={`n${x}${y}`} cx={x} cy={y} r={4.2} fill="#2A2350" />
      ))}
    </G>
  ),
  optimizers: (
    <G>
      <Ellipse cx={34} cy={34} rx={26} ry={18} /><Ellipse cx={34} cy={34} rx={16} ry={10.5} opacity={0.7} /><Ellipse cx={34} cy={34} rx={7} ry={4.5} opacity={0.5} />
      <Path d="M6 10l10 24 6-18 5 16 4-9 3 11" />
      {DOT(34, 34, 3)}
    </G>
  ),
  cnn: (
    <G>
      <Rect x={6} y={18} width={28} height={28} rx={4} />
      <Path d="M15.3 18v28M24.6 18v28M6 27.3h28M6 36.6h28" opacity={0.45} />
      <Rect x={30} y={12} width={20} height={20} rx={4} />
      <Rect x={44} y={8} width={12} height={12} rx={3} />
      <Path d="M24.6 27.3L30 22" strokeDasharray="1 3" />
    </G>
  ),
  rnn: (
    <G>
      <Circle cx={16} cy={38} r={7} /><Circle cx={48} cy={38} r={7} />
      <Line x1={23} y1={38} x2={41} y2={38} />
      <Path d="M11 32c-4-14 14-14 10 0" /><Path d="M43 32c-4-14 14-14 10 0" />
      <Path d="M38 34.5l3 3.5-3.5 3" />
      <Path d="M16 45v8M48 45v8" opacity={0.55} />
    </G>
  ),
  embeddings: (
    <G>
      <Path d="M14 50V10M14 50h42M14 50L4 60" opacity={0.6} />
      <Path d="M24 40h22l8-20H32Z" strokeDasharray="3 4" />
      {DOT(24, 40, 3.4)}{DOT(46, 40, 3.4)}{DOT(32, 20, 3.4)}{DOT(54, 20, 3.4)}
    </G>
  ),
  attention: (
    <G>
      {[[8, 1.2], [22, 3.4], [36, 1.6], [50, 4.2]].map(([x, w]) => (
        <Line key={x} x1={x + 3} y1={16} x2={32} y2={48} strokeWidth={w} opacity={0.35 + w / 7} />
      ))}
      {[8, 22, 36, 50].map(x => <Rect key={`t${x}`} x={x} y={8} width={7} height={7} rx={2} fill="#2A2350" />)}
      <Circle cx={32} cy={50} r={6} fill="#2A2350" />
    </G>
  ),
  transformer: (
    <G>
      <Rect x={14} y={40} width={36} height={12} rx={4} />
      <Rect x={14} y={24} width={36} height={12} rx={4} />
      <Rect x={14} y={8} width={36} height={12} rx={4} />
      <Path d="M32 52v8M32 36v4M32 20v4" opacity={0.6} />
      <Path d="M20 14h10M20 30h18M20 46h6" opacity={0.6} />
    </G>
  ),
  'llm-training': (
    <G>
      <Rect x={14} y={14} width={36} height={36} rx={8} />
      <Path d="M22 14V8M32 14V8M42 14V8M22 56v-6M32 56v-6M42 56v-6M14 22H8M14 32H8M14 42H8M56 22h-6M56 32h-6M56 42h-6" />
      <Path d="M32 22l2.6 7.4L42 32l-7.4 2.6L32 42l-2.6-7.4L22 32l7.4-2.6Z" />
    </G>
  ),
  rlhf: (
    <G>
      <Path d="M32 8l6.5 13.2 14.5 2.1-10.5 10.2 2.5 14.5L32 41.2l-13 6.8 2.5-14.5L11 23.3l14.5-2.1Z" />
      <Path d="M14 58h36" />
      <Path d="M24 58v-4M32 58v-6M40 58v-8" />
    </G>
  ),
  rag: (
    <G>
      <Path d="M12 8h22l10 10v32a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4Z" />
      <Path d="M34 8v10h10" />
      <Path d="M15 26h18M15 33h12M15 40h8" opacity={0.6} />
      <Circle cx={43} cy={43} r={9} fill="#2A2350" />
      <Line x1={49.5} y1={49.5} x2={57} y2={57} />
    </G>
  ),
  'fine-tuning': (
    <G>
      <Line x1={14} y1={8} x2={14} y2={56} /><Line x1={32} y1={8} x2={32} y2={56} /><Line x1={50} y1={8} x2={50} y2={56} />
      <Rect x={8} y={36} width={12} height={8} rx={3} fill="#2A2350" />
      <Rect x={26} y={16} width={12} height={8} rx={3} fill="#2A2350" />
      <Rect x={44} y={28} width={12} height={8} rx={3} fill="#2A2350" />
    </G>
  ),
  agents: (
    <G>
      <Ellipse cx={32} cy={32} rx={26} ry={16} strokeDasharray="3 4" opacity={0.7} />
      <Path d="M32 32L8 26M32 32l18-13M32 32l20 12M32 32l-10 15" opacity={0.5} />
      <Circle cx={32} cy={32} r={7} fill="#2A2350" />
      {DOT(8, 26, 3.2)}{DOT(50, 19, 3.2)}{DOT(52, 44, 3.2)}{DOT(22, 47, 3.2)}
    </G>
  ),
  evals: (
    <G>
      <Rect x={10} y={8} width={44} height={48} rx={7} />
      <Path d="M17 21l3 3 6-6M17 34l3 3 6-6" />
      <Rect x={17} y={43} width={8} height={7} rx={2} opacity={0.6} />
      <Path d="M31 21h16M31 34h16M31 46.5h10" opacity={0.6} />
    </G>
  ),
  prompting: (
    <G>
      <Path d="M12 10h40a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6H26l-12 10V44h-2a6 6 0 0 1-6-6V16a6 6 0 0 1 6-6Z" />
      <Path d="M16 21h26M16 29h18" opacity={0.6} />
      <Line x1={40} y1={26} x2={40} y2={33} />
    </G>
  ),
  review: (
    <G>
      <Circle cx={32} cy={32} r={24} />
      <Path d="M25 26a7 7 0 1 1 10 6.4c-2 1-3 2.6-3 4.6v1.5" />
      {DOT(32, 45, 2.6)}
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

/** The hero: a floating glass orb holding one white line glyph, lit from behind by violet. */
export function TopicArt({ topic, size = 148 }: { topic: TopicKey; size?: number }) {
  const halo = size * 1.7;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Soft violet light behind the orb */}
      <Svg width={halo} height={halo} style={{ position: 'absolute' }} pointerEvents="none">
        <Defs>
          <RadialGradient id="halo" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0.3" stopColor="#7C3AED" stopOpacity={0.45} />
            <Stop offset="0.65" stopColor="#4F46E5" stopOpacity={0.14} />
            <Stop offset="1" stopColor="#4F46E5" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={halo / 2} cy={halo / 2} r={halo / 2} fill="url(#halo)" />
      </Svg>
      <Glass radius={size / 2} style={{ width: size, height: size }} tint="rgba(24,20,48,0.38)" border="rgba(255,255,255,0.16)">
        <Svg width={size} height={size} viewBox="0 0 148 148">
          <Defs>
            <LinearGradient id="orbLight" x1="0.15" y1="0.1" x2="0.85" y2="0.95">
              <Stop offset="0" stopColor="#A78BFA" stopOpacity={0.32} />
              <Stop offset="0.55" stopColor="#6D28D9" stopOpacity={0.10} />
              <Stop offset="1" stopColor="#4F46E5" stopOpacity={0.22} />
            </LinearGradient>
            <LinearGradient id="ink" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#DDD6FE" /><Stop offset="1" stopColor="#C4B5FD" />
            </LinearGradient>
          </Defs>
          <Circle cx={74} cy={74} r={74} fill="url(#orbLight)" />
          <Path d="M30 52 A 50 50 0 0 1 64 25" stroke="#FFFFFF" strokeOpacity={0.45} strokeWidth={2} strokeLinecap="round" fill="none" />
          <G transform="translate(38 38) scale(1.125)" fill="none" stroke="#FFFFFF" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
            {GLYPH[topic]}
          </G>
        </Svg>
      </Glass>
    </View>
  );
}

/** Small version of a glyph for lists. */
export function TopicGlyph({ topic, size = 22, color = '#E9E5FF' }: { topic: TopicKey; size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <LinearGradient id="ink" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={color} /><Stop offset="1" stopColor={color} />
        </LinearGradient>
      </Defs>
      <G fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">{GLYPH[topic]}</G>
    </Svg>
  );
}
