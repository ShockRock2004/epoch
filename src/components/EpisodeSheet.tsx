import React, { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInRight, FadeInLeft } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Episode } from '../data/plan';
import { PHASES } from '../data/plan';
import { C, FONT, GLASS, PHASE_COLOR, R, S, T, fmtMins } from '../theme';
import { GradientButton } from './Buttons';
import { Sheet } from './Overlay';
import { GRAD } from '../theme';
import { Bullets, CheckButton, pad2, segRange, toggleWithUndo } from './EpisodeCard';
import { TOPIC_LABEL, TopicGlyph } from './illustrations';
import { IconCheck, IconChevron, IconClock, IconPlay, IconX } from './Icons';
import { openSeg } from '../lib/youtube';
import { haptic } from '../lib/haptics';

type Props = {
  list: Episode[]; // the results the sheet pages through, in their current order
  index: number | null;
  onIndex: (i: number) => void;
  onClose: () => void;
  isDone: (n: number) => boolean;
  onToggle: (n: number) => void;
};

/** Everything about one episode, with ‹ › to step through the current results. */
export function EpisodeSheet({ list, index, onIndex, onClose, isDone, onToggle }: Props) {
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const dir = useRef<1 | -1>(1);
  const ep = index != null ? list[index] : null;

  useEffect(() => { scroll.current?.scrollTo({ y: 0, animated: false }); }, [index]);

  const step = (d: 1 | -1) => {
    if (index == null) return;
    const next = index + d;
    if (next < 0 || next >= list.length) return;
    haptic.select();
    dir.current = d;
    onIndex(next);
  };

  return (
    <Sheet visible={!!ep} onClose={onClose} wrapStyle={{ top: insets.top + S.xl }} style={styles.sheet}>
      {ep && (
        <>
          {/* Top bar */}
          <View style={styles.bar}>
            <View style={styles.stepper}>
              <BarButton onPress={() => step(-1)} enabled={index! > 0} label="Previous episode"><IconChevron dir="left" size={17} color={C.ink} strokeWidth={2} /></BarButton>
              <Text style={styles.count}>{index! + 1} of {list.length}</Text>
              <BarButton onPress={() => step(1)} enabled={index! < list.length - 1} label="Next episode"><IconChevron size={17} color={C.ink} strokeWidth={2} /></BarButton>
            </View>
            <BarButton onPress={onClose} enabled label="Close"><IconX size={16} color={C.ink} strokeWidth={2} /></BarButton>
          </View>

          <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <Animated.View key={ep.n} entering={(dir.current > 0 ? FadeInRight : FadeInLeft).duration(220)}>
              {/* Identity */}
              <View style={styles.idRow}>
                <View style={styles.tile}><TopicGlyph topic={ep.topic} size={26} /></View>
                <View style={{ flex: 1 }}>
                  <View style={styles.labelRow}>
                    <View style={[styles.dot, { backgroundColor: PHASE_COLOR[ep.phase] }]} />
                    <Text style={T.tag}>Episode {pad2(ep.n)} · {PHASES[ep.phase].short}</Text>
                  </View>
                  <Text style={[T.meta, { color: C.ink2 }]}>{TOPIC_LABEL[ep.topic]}</Text>
                </View>
              </View>
              <Text style={styles.title}>{ep.name}</Text>

              {/* Facts */}
              <View style={styles.pills}>
                <Pill><IconClock size={13} color={C.ink2} /><Text style={styles.pillText}>{ep.review ? '~20 min' : fmtMins(ep.secs)}</Text></Pill>
                <Pill><Text style={styles.pillText}>{ep.review ? 'Review' : `${ep.segs.length} video${ep.segs.length > 1 ? 's' : ''}`}</Text></Pill>
                <Pill><Text style={styles.pillText}>Plan day {Math.ceil(ep.n / 2)}</Text></Pill>
                {isDone(ep.n) && (
                  <Pill accent><IconCheck size={13} color={C.accent} strokeWidth={2.4} /><Text style={[styles.pillText, { color: C.accent }]}>DONE</Text></Pill>
                )}
              </View>

              {/* Summary */}
              <Text style={styles.section}>WHAT YOU’LL LEARN</Text>
              <Bullets items={ep.points} gap={S.md - 2} />

              {/* Videos */}
              {ep.segs.length > 0 && (
                <>
                  <Text style={styles.section}>VIDEOS</Text>
                  <View style={{ gap: S.sm }}>
                    {ep.segs.map((s, i) => (
                      <Pressable
                        key={i}
                        onPress={() => { haptic.nav(); openSeg(s); }}
                        style={({ pressed }) => [styles.video, pressed && { backgroundColor: 'rgba(255,255,255,0.09)' }]}
                        accessibilityRole="link"
                        accessibilityLabel={`Play ${s.title}`}
                      >
                        <Text style={styles.videoNum}>{i + 1}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={[T.secondary, { color: C.ink }]} numberOfLines={2}>{s.title}</Text>
                          <Text style={[T.meta, { marginTop: 2, fontVariant: ['tabular-nums'] }]}>
                            {s.channel} · {s.ranged ? `${segRange(s)} of ${segRange({ ...s, ranged: false })}` : segRange(s)}
                          </Text>
                        </View>
                        <LinearGradient colors={GRAD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.play}><IconPlay size={11} color={C.ink} /></LinearGradient>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}

              {/* Review questions */}
              {ep.review && (
                <>
                  <Text style={styles.section}>QUESTIONS</Text>
                  <View style={{ gap: S.md }}>
                    {ep.review.q.map((q, i) => (
                      <View key={i} style={styles.qRow}>
                        <Text style={styles.qNum}>{i + 1}</Text>
                        <Text style={[T.body, { flex: 1, color: C.ink }]}>{q}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </Animated.View>
          </ScrollView>

          {/* Actions: done is a state you toggle, Start is the one primary action */}
          <View style={styles.footer}>
            <Pressable
              onPress={() => toggleWithUndo(ep.n, isDone(ep.n), onToggle)}
              style={({ pressed }) => [styles.doneRow, pressed && { backgroundColor: GLASS.fieldOn }]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isDone(ep.n) }}
            >
              <View pointerEvents="none"><CheckButton done={isDone(ep.n)} onPress={() => {}} label="" /></View>
              <Text style={styles.doneText}>{isDone(ep.n) ? 'Done' : 'Mark done'}</Text>
            </Pressable>
            {!ep.review && (
              <GradientButton
                label={isDone(ep.n) ? 'Rewatch' : 'Start'}
                height={48}
                style={{ flex: 1 }}
                icon={<IconPlay size={12} color={C.ink} />}
                onPress={() => { haptic.nav(); openSeg(ep.segs[0]); }}
                a11y={`${isDone(ep.n) ? 'Rewatch' : 'Start'} ${ep.name} on YouTube`}
              />
            )}
          </View>
        </>
    )}
    </Sheet>
  );
}

function Pill({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return <View style={[styles.pill, accent && { borderColor: C.accentLine, backgroundColor: 'rgba(192,38,211,0.18)' }]}>{children}</View>;
}

function BarButton({ children, onPress, enabled, label }: { children: React.ReactNode; onPress: () => void; enabled: boolean; label: string }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!enabled}
      hitSlop={8}
      style={({ pressed }) => [styles.barBtn, !enabled && { opacity: 0.3 }, pressed && { backgroundColor: GLASS.activeFill }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
    sheet: { flex: 1 },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: S.md, paddingTop: S.md, paddingBottom: S.sm },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  count: { color: C.ink2, fontFamily: FONT[500], fontSize: 13, minWidth: 64, textAlign: 'center', fontVariant: ['tabular-nums'] },
  barBtn: { width: 44, height: 44, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', backgroundColor: GLASS.field, borderWidth: 1, borderColor: GLASS.border },
  body: { paddingHorizontal: S.xl, paddingTop: S.md, paddingBottom: S.xl },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: S.md },
  tile: { width: 48, height: 48, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(192,38,211,0.2)', borderWidth: 1, borderColor: 'rgba(232,121,249,0.32)' },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  dot: { width: 5, height: 5, borderRadius: 3 },
  title: { fontFamily: FONT[800], fontSize: 21, lineHeight: 28, color: C.ink, marginTop: S.lg },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm, marginTop: S.md },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, minHeight: 30, borderRadius: R.sm, borderWidth: 1, borderColor: GLASS.border, backgroundColor: GLASS.field },
  pillText: { color: C.ink2, fontFamily: FONT[500], fontSize: 12 },
  section: { ...T.label, marginTop: S.xxl, marginBottom: S.md },
  video: { flexDirection: 'row', alignItems: 'center', gap: S.md, padding: S.md, borderRadius: R.md, backgroundColor: GLASS.field, borderWidth: 1, borderColor: GLASS.border },
  videoNum: { width: 24, height: 24, borderRadius: 12, textAlign: 'center', lineHeight: 24, color: C.ink, fontFamily: FONT[600], fontSize: 12, backgroundColor: 'rgba(192,38,211,0.35)', overflow: 'hidden' },
  play: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', paddingLeft: 2 },
  qRow: { flexDirection: 'row', gap: S.md },
  qNum: { color: C.accent, fontFamily: FONT[600], fontSize: 14, lineHeight: 22, width: 16 },
  footer: { flexDirection: 'row', gap: S.sm, padding: S.md, borderTopWidth: 1, borderTopColor: GLASS.border },
  doneRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 48, paddingRight: S.md, borderRadius: R.md, backgroundColor: GLASS.field, borderWidth: 1, borderColor: GLASS.border },
  doneText: { color: C.ink, fontFamily: FONT[600], fontSize: 14 },
});
