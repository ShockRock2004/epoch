import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EPISODES, Episode, PHASES, Phase } from '../data/plan';
import { TOPIC_LABEL, TopicGlyph } from '../components/illustrations';
import { useStore } from '../lib/store';
import { C, FONT, PHASE_COLOR, R, S, T, fmtMins } from '../theme';
import { Surface } from '../components/Surface';
import { EpisodeCard } from '../components/EpisodeCard';
import { useTabClearance } from '../components/TabBar';
import { IconCheck, IconFilter, IconSearch, IconX } from '../components/Icons';
import { haptic } from '../lib/haptics';

type Status = 'all' | 'todo' | 'done' | 'today';
type Kind = 'all' | 'video' | 'review';
type Len = 'all' | 'short' | 'mid' | 'long';
type Sort = 'plan' | 'short' | 'long';

const INDEX = EPISODES.map(e =>
  [e.name, e.summary, TOPIC_LABEL[e.topic], PHASES[e.phase].name, ...e.segs.flatMap(s => [s.title, s.channel]), ...(e.review?.q ?? [])]
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

function Chip({ label, on, onPress, dot }: { label: string; on: boolean; onPress: () => void; dot?: string }) {
  return (
    <Pressable
      onPress={() => { haptic.select(); onPress(); }}
      style={[styles.chip, on && styles.chipOn]}
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
  const [q, setQ] = useState('');
  const [phase, setPhase] = useState<Phase | 0>(0);
  const [status, setStatus] = useState<Status>('all');
  const [kind, setKind] = useState<Kind>('all');
  const [len, setLen] = useState<Len>('all');
  const [sort, setSort] = useState<Sort>('plan');
  const [sheet, setSheet] = useState(false);
  const [open, setOpen] = useState<Episode | null>(null);

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

  const clear = () => { setQ(''); setPhase(0); setStatus('all'); setKind('all'); setLen('all'); setSort('plan'); };

  const header = (
    <View style={{ paddingTop: insets.top + S.xl, gap: S.md }}>
      <View style={styles.titleRow}>
        <Text style={T.heading}>Search</Text>
        <Text style={T.meta}>{results.length} of {EPISODES.length}</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.input}>
          <IconSearch size={17} color={C.muted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Episodes, topics, channels"
            placeholderTextColor={C.faint}
            style={styles.inputText}
            returnKeyType="search"
            autoCorrect={false}
            selectionColor={C.accent}
          />
          {!!q && (
            <Pressable onPress={() => setQ('')} hitSlop={10} accessibilityLabel="Clear search"><IconX size={15} color={C.muted} /></Pressable>
          )}
        </View>
        <Pressable onPress={() => { haptic.nav(); setSheet(true); }} style={[styles.filterBtn, extraFilters > 0 && styles.chipOn]} accessibilityLabel="More filters">
          <IconFilter size={18} color={extraFilters ? C.ink : C.ink2} />
          {extraFilters > 0 && <View style={styles.badge} />}
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="All phases" on={phase === 0} onPress={() => setPhase(0)} />
        {([1, 2, 3, 4, 5] as Phase[]).map(ph => (
          <Chip key={ph} label={PHASES[ph].short} on={phase === ph} onPress={() => setPhase(phase === ph ? 0 : ph)} dot={PHASE_COLOR[ph]} />
        ))}
      </ScrollView>

      <View style={styles.segment}>
        {STATUS.map(([k, l]) => (
          <Pressable key={k} onPress={() => { haptic.select(); setStatus(k); }} style={[styles.segBtn, status === k && styles.segOn]} accessibilityRole="button" accessibilityState={{ selected: status === k }}>
            <Text style={[styles.segText, status === k && styles.segTextOn]}>{l}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={results}
        keyExtractor={e => String(e.n)}
        ListHeaderComponent={header}
        ListHeaderComponentStyle={{ marginBottom: S.lg }}
        contentContainerStyle={{ paddingHorizontal: S.lg, paddingBottom: clearance, gap: S.sm }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={12}
        renderItem={({ item: e }) => {
          const done = !!p.done[e.n];
          const channels = e.segs.map(s => s.channel).filter((c, i, a) => a.indexOf(c) === i).join(' · ');
          return (
            <Pressable onPress={() => { haptic.nav(); setOpen(e); }} accessibilityRole="button" accessibilityLabel={`Episode ${e.n}: ${e.name}${done ? ', done' : ''}`}>
              {({ pressed }) => (
                <Surface style={[styles.row, pressed && { backgroundColor: C.raised }]}>
                  <View style={styles.tile}>
                    <TopicGlyph topic={e.topic} size={20} color={C.ink2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.rowTop}>
                      <Text style={T.label}>EP {String(e.n).padStart(2, '0')}</Text>
                      <View style={[styles.dot, { backgroundColor: PHASE_COLOR[e.phase] }]} />
                      <Text style={T.label}>{TOPIC_LABEL[e.topic].toUpperCase()}</Text>
                      {todays.includes(e.n) && <Text style={styles.today}>Today</Text>}
                    </View>
                    <Highlight text={e.name} q={query} style={styles.rowName} lines={1} />
                    <Highlight text={e.review ? 'Review · no video' : channels} q={query} style={[T.meta, { marginTop: 2 }]} lines={1} />
                  </View>
                  <View style={styles.rowEnd}>
                    {done ? <IconCheck size={15} color={C.accent} strokeWidth={2.4} /> : null}
                    <Text style={[T.meta, { color: C.faint }]}>{e.review ? '20m' : `${Math.round(e.secs / 60)}m`}</Text>
                  </View>
                </Surface>
              )}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[T.title, { fontSize: 16 }]}>Nothing matches</Text>
            <Text style={T.meta}>Try a different word, or loosen the filters.</Text>
            {anyFilter && (
              <Pressable onPress={clear} style={styles.clearBtn}><Text style={styles.clearText}>Clear filters</Text></Pressable>
            )}
          </View>
        }
      />

      {/* Episode detail: the same card as Home. */}
      <Modal visible={!!open} transparent animationType="fade" onRequestClose={() => setOpen(null)} statusBarTranslucent navigationBarTranslucent>
        <Pressable style={styles.scrim} onPress={() => setOpen(null)} accessibilityLabel="Close" />
        {open && (
          <View style={styles.detail} pointerEvents="box-none">
            <EpisodeCard ep={open} done={!!p.done[open.n]} onToggle={toggle} minHeight={220} />
            <Text style={[T.meta, { textAlign: 'center', marginTop: S.md }]}>Tap the card for its summary · hold to mark {p.done[open.n] ? 'not done' : 'done'}</Text>
          </View>
        )}
      </Modal>

      {/* More filters */}
      <Modal visible={sheet} transparent animationType="fade" onRequestClose={() => setSheet(false)} statusBarTranslucent navigationBarTranslucent>
        <Pressable style={styles.scrim} onPress={() => setSheet(false)} accessibilityLabel="Close" />
        <View style={[styles.sheetWrap, { paddingBottom: insets.bottom + S.lg }]} pointerEvents="box-none">
          <Surface tone="base" radius={R.lg} style={styles.sheet}>
            <View style={styles.grab} />
            <Text style={T.title}>Filters</Text>
            <Text style={styles.sheetLabel}>Type</Text>
            <View style={styles.wrapRow}>
              {([['all', 'Everything'], ['video', 'Videos'], ['review', 'Reviews']] as [Kind, string][]).map(([k, l]) => (
                <Chip key={k} label={l} on={kind === k} onPress={() => setKind(k)} />
              ))}
            </View>
            <Text style={styles.sheetLabel}>Length</Text>
            <View style={styles.wrapRow}>
              {LENS.map(l => <Chip key={l.key} label={l.label} on={len === l.key} onPress={() => setLen(l.key)} />)}
            </View>
            <Text style={styles.sheetLabel}>Sort</Text>
            <View style={styles.wrapRow}>
              {([['plan', 'Plan order'], ['short', 'Shortest first'], ['long', 'Longest first']] as [Sort, string][]).map(([k, l]) => (
                <Chip key={k} label={l} on={sort === k} onPress={() => setSort(k)} />
              ))}
            </View>
            <View style={styles.sheetActions}>
              <Pressable onPress={() => { haptic.undo(); setKind('all'); setLen('all'); setSort('plan'); }} style={styles.btnQuiet}>
                <Text style={styles.btnQuietText}>Reset</Text>
              </Pressable>
              <Pressable onPress={() => setSheet(false)} style={styles.btn}>
                <Text style={styles.btnText}>Show {results.length} episodes</Text>
              </Pressable>
            </View>
          </Surface>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  searchRow: { flexDirection: 'row', gap: S.sm },
  input: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: S.sm, paddingHorizontal: S.md + 2, height: 44, borderRadius: R.md, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  inputText: { flex: 1, color: C.ink, fontFamily: FONT[400], fontSize: 14.5, paddingVertical: 0 },
  filterBtn: { width: 44, height: 44, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  badge: { position: 'absolute', top: 9, right: 9, width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent },
  chips: { gap: S.sm, paddingRight: S.lg },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: S.md, height: 32, borderRadius: R.pill, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
  chipOn: { backgroundColor: C.hover, borderColor: C.border2 },
  chipText: { color: C.muted, fontFamily: FONT[500], fontSize: 13 },
  chipTextOn: { color: C.ink },
  dot: { width: 5, height: 5, borderRadius: 3 },
  segment: { flexDirection: 'row', backgroundColor: C.bg2, borderRadius: R.md, padding: 3, borderWidth: 1, borderColor: C.border },
  segBtn: { flex: 1, height: 32, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: C.raised },
  segText: { color: C.muted, fontFamily: FONT[500], fontSize: 13 },
  segTextOn: { color: C.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingVertical: S.md + 2, paddingHorizontal: S.md + 2, borderRadius: R.card - 2 },
  tile: { width: 40, height: 40, borderRadius: R.md, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg2, borderWidth: 1, borderColor: C.border },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowName: { fontFamily: FONT[600], fontSize: 15, lineHeight: 20, color: C.ink, marginTop: 3 },
  rowEnd: { alignItems: 'flex-end', justifyContent: 'center', gap: 4, minWidth: 28 },
  today: { fontFamily: FONT[500], fontSize: 10.5, color: C.accent, marginLeft: 4 },
  hit: { color: C.ink, backgroundColor: 'rgba(154,167,255,0.22)' },
  empty: { alignItems: 'center', paddingTop: S.xxxl * 1.5, gap: S.sm },
  clearBtn: { marginTop: S.md, paddingHorizontal: S.lg, height: 36, borderRadius: R.sm + 2, borderWidth: 1, borderColor: C.border2, justifyContent: 'center' },
  clearText: { color: C.ink, fontFamily: FONT[500], fontSize: 13.5 },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(3,5,8,0.78)' },
  detail: { flex: 1, justifyContent: 'center', paddingHorizontal: S.lg },
  sheetWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: S.md },
  sheet: { padding: S.xl, paddingTop: S.md },
  grab: { alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: C.border2, marginBottom: S.lg },
  sheetLabel: { ...T.label, marginTop: S.xl, marginBottom: S.sm },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  sheetActions: { flexDirection: 'row', gap: S.sm, marginTop: S.xxl },
  btn: { flex: 1, height: 44, borderRadius: R.sm + 2, backgroundColor: C.light, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: C.onLight, fontFamily: FONT[600], fontSize: 14.5 },
  btnQuiet: { height: 44, paddingHorizontal: S.xl, borderRadius: R.sm + 2, borderWidth: 1, borderColor: C.border2, justifyContent: 'center' },
  btnQuietText: { color: C.ink2, fontFamily: FONT[500], fontSize: 14.5 },
});
