import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EPISODES, Episode, PHASES, Phase } from '../data/plan';
import { TOPIC_LABEL, TopicGlyph } from '../components/illustrations';
import { useStore } from '../lib/store';
import { C, FONT, GLASS, PHASE_COLOR, R, S, T } from '../theme';
import { Glass } from '../components/Glass';
import { BlackButton, GradientButton, GradientSegment } from '../components/Buttons';
import { Pager } from '../components/Pager';
import { EpisodeSheet } from '../components/EpisodeSheet';
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

function Chip({ label, on, onPress, dot, solid }: { label: string; on: boolean; onPress: () => void; dot?: string; solid?: boolean }) {
  return (
    <Pressable onPress={() => { haptic.select(); onPress(); }} accessibilityRole="button" accessibilityState={{ selected: on }}>
      <Glass
        radius={R.sm}
        tint={on ? C.light : 'rgba(0,0,0,0.38)'}
        border={on ? C.light : GLASS.borderHi}
        highlight={false}
        style={styles.chip}
      >
        <View style={styles.chipRow}>
          {dot && <View style={[styles.dot, { backgroundColor: dot }]} />}
          <Text style={[styles.chipText, on && styles.chipTextOn]}>{label}</Text>
        </View>
      </Glass>
    </Pressable>
  );
}

export function Search() {
  const { p, today, toggle } = useStore();
  const insets = useSafeAreaInsets();
  const clearance = useTabClearance();
  const list = useRef<FlatList<Episode>>(null);
  const [q, setQ] = useState('');
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
    list.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const clear = () => { setQ(''); setPhase(0); setStatus('all'); setKind('all'); setLen('all'); setSort('plan'); };

  const header = (
    <View style={{ paddingTop: insets.top + S.xl, gap: S.md }}>
      <View>
        <Text style={styles.screenTitle}>SEARCH</Text>
        <Text style={[T.label, { color: C.muted }]}>{results.length} OF {EPISODES.length} EPISODES</Text>
      </View>

      <View style={styles.searchRow}>
        <Glass radius={R.md} tint="rgba(0,0,0,0.42)" border={GLASS.borderHi} highlight={false} style={styles.input}>
          <View style={styles.inputRow}>
            <IconSearch size={17} color={C.ink2} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Episodes, topics, channels"
              placeholderTextColor={C.muted}
              style={styles.inputText}
              returnKeyType="search"
              autoCorrect={false}
              selectionColor={C.accent}
            />
            {!!q && (
              <Pressable onPress={() => setQ('')} hitSlop={10} accessibilityLabel="Clear search"><IconX size={15} color={C.ink2} /></Pressable>
            )}
          </View>
        </Glass>
        <Pressable onPress={() => { haptic.nav(); setSheet(true); }} accessibilityLabel="More filters">
          <Glass radius={R.md} border={extraFilters ? C.accent : GLASS.borderHi} tint={extraFilters ? 'rgba(192,38,211,0.35)' : 'rgba(0,0,0,0.42)'} highlight={false} style={styles.filterBtn}>
            <View style={styles.center}>
              <IconFilter size={18} color={C.ink} />
              {extraFilters > 0 && <View style={styles.badge} />}
            </View>
          </Glass>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="All phases" on={phase === 0} onPress={() => setPhase(0)} />
        {([1, 2, 3, 4, 5] as Phase[]).map(ph => (
          <Chip key={ph} label={PHASES[ph].short} on={phase === ph} onPress={() => setPhase(phase === ph ? 0 : ph)} dot={PHASE_COLOR[ph]} />
        ))}
      </ScrollView>

      <GradientSegment items={STATUS} value={status} onChange={k => { haptic.select(); setStatus(k); }} />

      {results.length > PAGE && (
        <Text style={[T.meta, { marginTop: S.xs }]}>
          Showing {page * PAGE + 1}–{Math.min(results.length, (page + 1) * PAGE)} of {results.length}
        </Text>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={list}
        data={pageItems}
        keyExtractor={e => String(e.n)}
        ListHeaderComponent={header}
        ListHeaderComponentStyle={{ marginBottom: S.md }}
        contentContainerStyle={{ paddingHorizontal: S.lg, paddingBottom: clearance, gap: S.sm }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        renderItem={({ item: e, index }) => {
          const done = !!p.done[e.n];
          const channels = e.segs.map(s => s.channel).filter((c, i, a) => a.indexOf(c) === i).join(' · ');
          return (
            <Animated.View entering={FadeIn.duration(220).delay(index * 25)}>
              <Pressable onPress={() => { haptic.nav(); setSnapshot(results); setOpen(page * PAGE + index); }} accessibilityRole="button" accessibilityLabel={`Episode ${e.n}: ${e.name}${done ? ', done' : ''}`}>
                {({ pressed }) => (
                  <Glass radius={R.card} border={done ? C.accentLine : GLASS.border} style={[styles.rowShadow, pressed && { transform: [{ scale: 0.985 }] }]}>
                    <View style={styles.row}>
                      <View style={styles.tile}><TopicGlyph topic={e.topic} size={20} /></View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.rowTop}>
                          <Text style={T.label}>EP {String(e.n).padStart(2, '0')}</Text>
                          <View style={[styles.dot, { backgroundColor: PHASE_COLOR[e.phase] }]} />
                          <Text style={T.label} numberOfLines={1}>{TOPIC_LABEL[e.topic].toUpperCase()}</Text>
                          {todays.includes(e.n) && <Text style={styles.today}>Today</Text>}
                        </View>
                        <Highlight text={e.name} q={query} style={styles.rowName} lines={1} />
                        <Highlight text={e.review ? 'Review · no video' : channels} q={query} style={[T.meta, { marginTop: 1 }]} lines={1} />
                      </View>
                      <View style={styles.rowEnd}>
                        {done && <IconCheck size={15} color={C.accent} strokeWidth={2.4} />}
                        <Text style={[T.meta, { color: C.ink2 }]}>{e.review ? '20m' : `${Math.round(e.secs / 60)}m`}</Text>
                      </View>
                    </View>
                  </Glass>
                )}
              </Pressable>
            </Animated.View>
          );
        }}
        ListFooterComponent={<Pager page={page} pages={pages} onChange={goPage} />}
        ListEmptyComponent={
          <Glass style={styles.empty}>
            <Text style={[T.title, { fontSize: 16 }]}>Nothing matches</Text>
            <Text style={T.meta}>Try a different word, or loosen the filters.</Text>
            {anyFilter && (
              <Pressable onPress={clear} style={styles.clearBtn}><Text style={styles.clearText}>CLEAR FILTERS</Text></Pressable>
            )}
          </Glass>
        }
      />

      <EpisodeSheet
        list={snapshot}
        index={open}
        onIndex={setOpen}
        onClose={() => setOpen(null)}
        isDone={n => !!p.done[n]}
        onToggle={toggle}
      />

      {/* More filters */}
      <Modal visible={sheet} transparent animationType="none" onRequestClose={() => setSheet(false)} statusBarTranslucent navigationBarTranslucent>
        <Animated.View entering={FadeIn.duration(200)} style={StyleSheet.absoluteFill}>
          <Pressable style={[StyleSheet.absoluteFill, styles.scrim]} onPress={() => setSheet(false)} accessibilityLabel="Close" />
        </Animated.View>
        <Animated.View entering={SlideInDown.duration(300)} style={[styles.sheetWrap, { paddingBottom: insets.bottom + S.lg }]} pointerEvents="box-none">
          <Glass radius={R.lg} border={GLASS.borderHi} style={styles.sheet}>
            <View style={styles.grab} />
            <Text style={T.title}>Filters</Text>
            <Text style={styles.sheetLabel}>TYPE</Text>
            <View style={styles.wrapRow}>
              {([['all', 'Everything'], ['video', 'Videos'], ['review', 'Reviews']] as [Kind, string][]).map(([k, l]) => (
                <Chip key={k} label={l} on={kind === k} onPress={() => setKind(k)} solid />
              ))}
            </View>
            <Text style={styles.sheetLabel}>LENGTH</Text>
            <View style={styles.wrapRow}>
              {LENS.map(l => <Chip key={l.key} label={l.label} on={len === l.key} onPress={() => setLen(l.key)} solid />)}
            </View>
            <Text style={styles.sheetLabel}>SORT</Text>
            <View style={styles.wrapRow}>
              {([['plan', 'Plan order'], ['short', 'Shortest first'], ['long', 'Longest first']] as [Sort, string][]).map(([k, l]) => (
                <Chip key={k} label={l} on={sort === k} onPress={() => setSort(k)} solid />
              ))}
            </View>
            <View style={styles.sheetActions}>
              <BlackButton label="Reset" height={48} onPress={() => { haptic.undo(); setKind('all'); setLen('all'); setSort('plan'); }} />
              <GradientButton label={`Show ${results.length} episodes`} height={48} style={{ flex: 1 }} onPress={() => setSheet(false)} />
            </View>
          </Glass>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screenTitle: { fontFamily: FONT[800], fontSize: 22, letterSpacing: 1.2, color: C.ink },
  searchRow: { flexDirection: 'row', gap: S.sm },
  input: { flex: 1, height: 48 },
  inputRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: S.sm, paddingHorizontal: S.md + 2 },
  inputText: { flex: 1, color: C.ink, fontFamily: FONT[400], fontSize: 14.5, paddingVertical: 0 },
  filterBtn: { width: 48, height: 48 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 11, right: 11, width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent },
  chips: { gap: S.sm, paddingRight: S.lg },
  chip: { height: 34 },
  chipRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: S.md + 2 },
  chipText: { color: C.ink2, fontFamily: FONT[600], fontSize: 12.5 },
  chipTextOn: { color: C.onLight, fontFamily: FONT[700] },
  dot: { width: 6, height: 6, borderRadius: 3 },
  segment: { height: 42 },
  segRow: { flex: 1, flexDirection: 'row', padding: 4 },
  segBtn: { flex: 1, borderRadius: R.sm - 2, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: GLASS.activeFill, borderWidth: 1, borderColor: GLASS.borderHi },
  segText: { color: C.muted, fontFamily: FONT[500], fontSize: 13 },
  segTextOn: { color: C.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingVertical: S.md + 2, paddingHorizontal: S.md + 2 },
  tile: { width: 42, height: 42, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(192,38,211,0.18)', borderWidth: 1, borderColor: 'rgba(232,121,249,0.28)' },
  rowShadow: { },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowName: { fontFamily: FONT[700], fontSize: 14.5, lineHeight: 21, color: C.ink, marginTop: 2 },
  rowEnd: { alignItems: 'flex-end', justifyContent: 'center', gap: 4, minWidth: 28 },
  today: { fontFamily: FONT[600], fontSize: 10.5, color: C.accent, marginLeft: 4 },
  hit: { color: C.ink, backgroundColor: 'rgba(192,38,211,0.55)' },
  empty: { alignItems: 'center', paddingVertical: S.xxxl, gap: S.sm },
  clearBtn: { marginTop: S.md, paddingHorizontal: S.lg, height: 40, borderRadius: R.md, backgroundColor: C.black, borderWidth: 1, borderColor: GLASS.borderHi, justifyContent: 'center' },
  clearText: { color: C.ink, fontFamily: FONT[700], fontSize: 11.5, letterSpacing: 1.6 },
  scrim: { backgroundColor: 'rgba(7,4,12,0.78)' },
  sheetWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: S.md },
  sheet: { padding: S.xl, paddingTop: S.md },
  grab: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: GLASS.borderHi, marginBottom: S.lg },
  sheetLabel: { ...T.label, marginTop: S.xl, marginBottom: S.sm },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  sheetActions: { flexDirection: 'row', gap: S.sm, marginTop: S.xxl },
  btn: { flex: 1, height: 48, borderRadius: R.md, backgroundColor: C.light, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: C.onLight, fontFamily: FONT[600], fontSize: 14.5 },
  btnGlass: { height: 48, paddingHorizontal: S.xl, borderRadius: R.md, borderWidth: 1, borderColor: GLASS.borderHi, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center' },
  btnGlassText: { color: C.ink, fontFamily: FONT[500], fontSize: 14.5 },
});
