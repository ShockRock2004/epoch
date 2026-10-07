import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EPISODES, Episode, PHASES, Phase } from '../data/plan';
import { TOPIC_LABEL, TopicGlyph } from '../components/illustrations';
import { useStore } from '../lib/store';
import { C, FONT, GLASS, PHASE_COLOR, R, S, T } from '../theme';
import { Glass } from '../components/Glass';
import { BlackButton, GradientButton, Segment } from '../components/Buttons';
import { Pager } from '../components/Pager';
import { EpisodeSheet } from '../components/EpisodeSheet';
import { Portal, Sheet } from '../components/Overlay';
import { useBackdropScroll } from '../components/Backdrop';
import { pad2 } from '../components/EpisodeCard';
import { useTabClearance } from '../components/TabBar';
import { IconCheck, IconFilter, IconSearch, IconX } from '../components/Icons';
import { haptic } from '../lib/haptics';

type Status = 'all' | 'todo' | 'done' | 'today';
type Kind = 'all' | 'video' | 'review';
type Len = 'all' | 'short' | 'mid' | 'long';
type Sort = 'plan' | 'short' | 'long';

const PAGE = 10;

const INDEX = EPISODES.map(e =>
  [e.name, ...e.points, TOPIC_LABEL[e.topic], PHASES[e.phase].name, ...e.segs.flatMap(s => [s.title, s.channel]), ...(e.review?.q ?? [])]
    .join(' \n ').toLowerCase());

const LENS: { key: Len; label: string; test: (m: number) => boolean }[] = [
  { key: 'all', label: 'Any length', test: () => true },
  { key: 'short', label: 'Under 15 min', test: m => m < 15 },
  { key: 'mid', label: '15–20 min', test: m => m >= 15 && m <= 20 },
  { key: 'long', label: 'Over 20 min', test: m => m > 20 },
];

const STATUS: [Status, string][] = [['all', 'All'], ['todo', 'To do'], ['done', 'Done'], ['today', 'Today']];

function Highlight({ text, q, style, lines }: { text: string; q: string; style: object; lines?: number }) {
  if (!q) return <Text style={style} numberOfLines={lines}>{text}</Text>;
  const parts: { t: string; hit: boolean }[] = [];
  const lower = text.toLowerCase();
  let i = 0;
  while (i < text.length) {
    const j = lower.indexOf(q, i);
    if (j < 0) { parts.push({ t: text.slice(i), hit: false }); break; }
    if (j > i) parts.push({ t: text.slice(i, j), hit: false });
    parts.push({ t: text.slice(j, j + q.length), hit: true });
    i = j + q.length;
  }
  return (
    <Text style={style} numberOfLines={lines}>
      {parts.map((p, k) => <Text key={k} style={p.hit ? styles.hit : undefined}>{p.t}</Text>)}
    </Text>
  );
}

/** A flat control that sits on glass. Selected = the white square, the app's one selection signature. */
function Chip({ label, on, onPress, dot }: { label: string; on: boolean; onPress: () => void; dot?: string }) {
  return (
    <Pressable
      onPress={() => { haptic.select(); onPress(); }}
      style={({ pressed }) => [styles.chip, on && styles.chipOn, pressed && !on && { backgroundColor: GLASS.fieldOn }]}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
    >
      {dot && <View style={[styles.dot, { backgroundColor: dot }]} />}
      <Text style={[styles.chipText, on && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

export function Search() {
  const { p, today, toggle } = useStore();
  const insets = useSafeAreaInsets();
  const clearance = useTabClearance();
  const onScroll = useBackdropScroll();
  const list = useRef<Animated.ScrollView>(null);
  const [headerH, setHeaderH] = useState(insets.top + 190);
  const [q, setQ] = useState('');
  const [focused, setFocused] = useState(false);
  const [phase, setPhase] = useState<Phase | 0>(0);
  const [status, setStatus] = useState<Status>('all');
  const [kind, setKind] = useState<Kind>('all');
  const [len, setLen] = useState<Len>('all');
  const [sort, setSort] = useState<Sort>('plan');
  const [page, setPage] = useState(0);
  const [sheet, setSheet] = useState(false);
  const [open, setOpen] = useState<number | null>(null); // index into the snapshot below
  const [snapshot, setSnapshot] = useState<Episode[]>([]); // frozen while the sheet is open, so marking done never shifts it

  const query = q.trim().toLowerCase();
  const todays = p.days[today]?.base ?? []; // the same pair Home opens on
  const extraFilters = (kind !== 'all' ? 1 : 0) + (len !== 'all' ? 1 : 0) + (sort !== 'plan' ? 1 : 0);
  const anyFilter = !!query || phase !== 0 || status !== 'all' || extraFilters > 0;

  const results = useMemo(() => {
    const lenTest = LENS.find(l => l.key === len)!.test;
    const out = EPISODES.filter((e, i) => {
      if (query && !INDEX[i].includes(query)) return false;
      if (phase && e.phase !== phase) return false;
      if (status === 'todo' && p.done[e.n]) return false;
      if (status === 'done' && !p.done[e.n]) return false;
      if (status === 'today' && !todays.includes(e.n)) return false;
      if (kind === 'video' && e.review) return false;
      if (kind === 'review' && !e.review) return false;
      return lenTest(e.secs / 60);
    });
    if (sort === 'short') out.sort((a, b) => a.secs - b.secs);
    if (sort === 'long') out.sort((a, b) => b.secs - a.secs);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, phase, status, kind, len, sort, p.done, todays.join()]);

  const pages = Math.max(1, Math.ceil(results.length / PAGE));
  const pageItems = results.slice(page * PAGE, page * PAGE + PAGE);

  // A new search or filter always starts on page one.
  useEffect(() => { setPage(0); }, [query, phase, status, kind, len, sort]);
  // Keep the page valid when marking episodes done shrinks a "To do" list.
  useEffect(() => { if (page > pages - 1) setPage(pages - 1); }, [page, pages]);

  const goPage = (n: number) => {
    setPage(n);
    list.current?.scrollTo({ y: 0, animated: true });
  };

  const clear = () => { setQ(''); setPhase(0); setStatus('all'); setKind('all'); setLen('all'); setSort('plan'); };

  return (
    <View style={{ flex: 1 }}>
      {/* Sticky frosted header: it floats above the content layer, so results frost as they scroll under it. */}
      <Portal layer="chrome">
        <Glass material="header" radius={0} style={styles.header}>
          <View style={[styles.headerIn, { paddingTop: insets.top + S.md }]} onLayout={e => setHeaderH(e.nativeEvent.layout.height)}>
            <View style={styles.searchRow}>
              <View style={[styles.input, focused && styles.inputFocused]}>
                <IconSearch size={17} color={C.ink2} />
                <TextInput
                  value={q}
                  onChangeText={setQ}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="Episodes, topics, channels"
                  placeholderTextColor={C.muted}
                  style={styles.inputText}
                  returnKeyType="search"
                  autoCorrect={false}
                  selectionColor={C.accent}
                />
                {!!q && (
                  <Pressable onPress={() => setQ('')} hitSlop={8} style={styles.clearX} accessibilityLabel="Clear search"><IconX size={15} color={C.ink2} /></Pressable>
                )}
              </View>
              <Pressable
                onPress={() => { haptic.nav(); setSheet(true); }}
                style={({ pressed }) => [styles.filterBtn, extraFilters > 0 && styles.filterOn, pressed && { backgroundColor: GLASS.fieldOn }]}
                accessibilityRole="button"
                accessibilityLabel={extraFilters ? `More filters, ${extraFilters} on` : 'More filters'}
              >
                <IconFilter size={18} color={C.ink} />
                {extraFilters > 0 && <View style={styles.badge} />}
              </Pressable>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.chipScroll}>
              <Chip label="All phases" on={phase === 0} onPress={() => setPhase(0)} />
              {([1, 2, 3, 4, 5] as Phase[]).map(ph => (
                <Chip key={ph} label={PHASES[ph].short} on={phase === ph} onPress={() => setPhase(phase === ph ? 0 : ph)} dot={PHASE_COLOR[ph]} />
              ))}
            </ScrollView>

            <Segment items={STATUS} value={status} onChange={k => { haptic.select(); setStatus(k); }} />
          </View>
          <View style={styles.headerLine} />
        </Glass>
      </Portal>

      <Animated.ScrollView
        ref={list}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: headerH + S.lg, paddingHorizontal: S.lg, paddingBottom: clearance }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[T.meta, styles.count]}>
          {results.length === EPISODES.length ? `${EPISODES.length} episodes` : `${results.length} of ${EPISODES.length} episodes`}
          {results.length > PAGE ? ` · showing ${page * PAGE + 1}–${Math.min(results.length, (page + 1) * PAGE)}` : ''}
        </Text>

        {/* One glass panel for the whole page of results: one blur instead of ten. */}
        <Glass>
          <View style={styles.panel}>
            {pageItems.length === 0 ? (
              <View style={styles.empty}>
                <Text style={[T.title, { fontSize: 16 }]}>Nothing matches</Text>
                <Text style={T.meta}>Try a different word, or loosen the filters.</Text>
                {anyFilter && (
                  <Pressable onPress={clear} style={({ pressed }) => [styles.clearBtn, pressed && { backgroundColor: GLASS.fieldOn }]} accessibilityRole="button">
                    <Text style={styles.clearText}>Clear filters</Text>
                  </Pressable>
                )}
              </View>
            ) : pageItems.map((e, index) => {
              const done = !!p.done[e.n];
              const channels = e.segs.map(s => s.channel).filter((c, i, a) => a.indexOf(c) === i).join(' · ');
              return (
                <Animated.View key={e.n} entering={FadeIn.duration(200).delay(index * 20)}>
                  {index > 0 && <View style={styles.divider} />}
                  <Pressable
                    onPress={() => { haptic.nav(); setSnapshot(results); setOpen(page * PAGE + index); }}
                    style={({ pressed }) => [styles.row, pressed && { backgroundColor: GLASS.fieldOn }]}
                    accessibilityRole="button"
                    accessibilityLabel={`Episode ${e.n}: ${e.name}${done ? ', done' : ''}`}
                  >
                    <View style={[styles.tile, done && styles.tileDone]}>
                      {done ? <IconCheck size={18} color={C.onLight} strokeWidth={2.6} /> : <TopicGlyph topic={e.topic} size={20} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.rowTop}>
                        <View style={[styles.dot, { backgroundColor: PHASE_COLOR[e.phase] }]} />
                        <Text style={[T.tag, { flexShrink: 1 }]} numberOfLines={1}>Ep {pad2(e.n)} · {TOPIC_LABEL[e.topic]}</Text>
                        {todays.includes(e.n) && <Text style={styles.today}>Today</Text>}
                      </View>
                      <Highlight text={e.name} q={query} style={[styles.rowName, done && { color: C.ink2 }]} lines={1} />
                      <Highlight text={e.review ? 'Review · no video' : channels} q={query} style={[T.meta, { marginTop: 1 }]} lines={1} />
                    </View>
                    <Text style={[T.meta, { color: C.ink2 }]}>{e.review ? '20m' : `${Math.round(e.secs / 60)}m`}</Text>
                  </Pressable>
                </Animated.View>
              );
            })}
            {pages > 1 && (
              <>
                <View style={styles.divider} />
                <Pager page={page} pages={pages} onChange={goPage} />
              </>
            )}
          </View>
        </Glass>
      </Animated.ScrollView>

      <EpisodeSheet
        list={snapshot}
        index={open}
        onIndex={setOpen}
        onClose={() => setOpen(null)}
        isDone={n => !!p.done[n]}
        onToggle={toggle}
      />

      {/* More filters */}
      <Sheet visible={sheet} onClose={() => setSheet(false)} style={styles.sheet}>
        <View style={styles.grab} />
        <Text style={T.title}>Filters</Text>
        <Text style={styles.sheetLabel}>TYPE</Text>
        <View style={styles.wrapRow}>
          {([['all', 'Everything'], ['video', 'Videos'], ['review', 'Reviews']] as [Kind, string][]).map(([k, l]) => (
            <Chip key={k} label={l} on={kind === k} onPress={() => setKind(k)} />
          ))}
        </View>
        <Text style={styles.sheetLabel}>LENGTH</Text>
        <View style={styles.wrapRow}>
          {LENS.map(l => <Chip key={l.key} label={l.label} on={len === l.key} onPress={() => setLen(l.key)} />)}
        </View>
        <Text style={styles.sheetLabel}>SORT</Text>
        <View style={styles.wrapRow}>
          {([['plan', 'Plan order'], ['short', 'Shortest first'], ['long', 'Longest first']] as [Sort, string][]).map(([k, l]) => (
            <Chip key={k} label={l} on={sort === k} onPress={() => setSort(k)} />
          ))}
        </View>
        <View style={styles.sheetActions}>
          <BlackButton label="Reset" height={48} onPress={() => { haptic.undo(); setKind('all'); setLen('all'); setSort('plan'); }} />
          <GradientButton label={`Show ${results.length} episodes`} height={48} style={{ flex: 1 }} onPress={() => setSheet(false)} />
        </View>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { position: 'absolute', top: 0, left: 0, right: 0 },
  headerIn: { paddingHorizontal: S.lg, paddingBottom: S.md, gap: S.sm + 2 },
  headerLine: { height: 1, backgroundColor: GLASS.divider },
  searchRow: { flexDirection: 'row', gap: S.sm },
  input: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: S.sm, minHeight: 48, paddingLeft: S.md + 2, borderRadius: R.md, backgroundColor: GLASS.field, borderWidth: 1, borderColor: GLASS.borderHi },
  inputFocused: { borderColor: 'rgba(199,125,255,0.6)', backgroundColor: 'rgba(255,255,255,0.07)' },
  inputText: { flex: 1, color: C.ink, fontFamily: FONT[400], fontSize: 14.5, paddingVertical: 0 },
  clearX: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  filterBtn: { width: 48, minHeight: 48, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', backgroundColor: GLASS.field, borderWidth: 1, borderColor: GLASS.borderHi },
  filterOn: { borderColor: C.accent, backgroundColor: 'rgba(192,38,211,0.24)' },
  badge: { position: 'absolute', top: 11, right: 11, width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent },
  chipScroll: { marginHorizontal: -S.lg },
  chips: { gap: S.sm, paddingHorizontal: S.lg },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, paddingHorizontal: S.md + 2, borderRadius: R.sm, backgroundColor: GLASS.field, borderWidth: 1, borderColor: GLASS.border },
  chipOn: { backgroundColor: C.light, borderColor: C.light },
  chipText: { color: C.ink2, fontFamily: FONT[600], fontSize: 13 },
  chipTextOn: { color: C.onLight, fontFamily: FONT[700] },
  dot: { width: 6, height: 6, borderRadius: 3 },
  count: { marginBottom: S.sm, marginLeft: S.xs },
  panel: { borderRadius: R.card, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: GLASS.divider, marginHorizontal: S.md + 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: S.md, minHeight: 72, paddingVertical: S.md, paddingHorizontal: S.md + 2 },
  tile: { width: 42, height: 42, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', backgroundColor: GLASS.field, borderWidth: 1, borderColor: GLASS.border },
  tileDone: { backgroundColor: C.light, borderColor: C.light },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowName: { fontFamily: FONT[700], fontSize: 14.5, lineHeight: 21, color: C.ink, marginTop: 2 },
  today: { fontFamily: FONT[600], fontSize: 11, color: C.accent, marginLeft: 4 },
  hit: { color: C.ink, backgroundColor: 'rgba(192,38,211,0.55)' },
  empty: { alignItems: 'center', paddingVertical: S.xxxl, gap: S.sm },
  clearBtn: { marginTop: S.md, paddingHorizontal: S.lg, minHeight: 44, borderRadius: R.md, backgroundColor: GLASS.field, borderWidth: 1, borderColor: GLASS.borderHi, justifyContent: 'center' },
  clearText: { color: C.ink, fontFamily: FONT[600], fontSize: 13.5 },
  sheet: { padding: S.xl, paddingTop: S.md },
  grab: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: GLASS.borderHi, marginBottom: S.lg },
  sheetLabel: { ...T.label, marginTop: S.xl, marginBottom: S.sm },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  sheetActions: { flexDirection: 'row', gap: S.sm, marginTop: S.xxl },
});
