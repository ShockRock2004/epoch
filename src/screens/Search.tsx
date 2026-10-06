import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EPISODES, Episode, PHASES, Phase } from '../data/plan';
import { TOPIC_LABEL } from '../components/illustrations';
import { useStore } from '../lib/store';
import { todayView } from '../lib/schedule';
import { C, PHASE_COLOR, R, alpha, fmtMins } from '../theme';
import { GlassView } from '../components/GlassView';
import { EpisodeCard } from '../components/EpisodeCard';
import { PartsSheet } from '../components/PartsSheet';
import { IconCheck, IconChevron, IconFilter, IconSearch, IconX } from '../components/Icons';
import { openSeg } from '../lib/youtube';
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
  { key: 'short', label: '< 15 min', test: m => m < 15 },
  { key: 'mid', label: '15–20 min', test: m => m >= 15 && m <= 20 },
  { key: 'long', label: '> 20 min', test: m => m > 20 },
];

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

function Chip({ label, on, onPress, color }: { label: string; on: boolean; onPress: () => void; color?: string }) {
  return (
    <Pressable onPress={() => { haptic.select(); onPress(); }} style={[styles.chip, on && styles.chipOn]} accessibilityRole="button" accessibilityState={{ selected: on }}>
      {color && <View style={[styles.dot, { backgroundColor: color }]} />}
      <Text style={[styles.chipText, on && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

export function Search({ bottomPad }: { bottomPad: number }) {
  const { p, today, toggle } = useStore();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const [phase, setPhase] = useState<Phase | 0>(0);
  const [status, setStatus] = useState<Status>('all');
  const [kind, setKind] = useState<Kind>('all');
  const [len, setLen] = useState<Len>('all');
  const [sort, setSort] = useState<Sort>('plan');
  const [sheet, setSheet] = useState(false);
  const [open, setOpen] = useState<Episode | null>(null);
  const [parts, setParts] = useState<Episode | null>(null);

  const query = q.trim().toLowerCase();
  const todays = todayView(p, today).shown;
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
  }, [query, phase, status, kind, len, sort, p.done, todays.join()]);

  const clear = () => { setQ(''); setPhase(0); setStatus('all'); setKind('all'); setLen('all'); setSort('plan'); };
  const onWatch = (ep: Episode) => (ep.segs.length > 1 ? setParts(ep) : openSeg(ep.segs[0]));

  const header = (
    <View style={{ paddingTop: insets.top + 14, gap: 12 }}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Search</Text>
        <Text style={styles.count}>{results.length} of {EPISODES.length}</Text>
      </View>
      <View style={styles.searchRow}>
        <GlassView radius={R.lg} style={styles.inputWrap}>
          <IconSearch size={18} color={C.muted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Episodes, topics, channels…"
            placeholderTextColor={C.faint}
            style={styles.input}
            returnKeyType="search"
            autoCorrect={false}
          />
          {!!q && (
            <Pressable onPress={() => setQ('')} hitSlop={10} accessibilityLabel="Clear search"><IconX size={16} color={C.muted} /></Pressable>
          )}
        </GlassView>
        <Pressable onPress={() => { haptic.nav(); setSheet(true); }} accessibilityLabel="More filters">
          <GlassView radius={R.lg} style={styles.filterBtn} tint={extraFilters ? C.accentWash : C.glass}>
            <IconFilter size={19} color={extraFilters ? C.accent : C.ink2} />
            {extraFilters > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{extraFilters}</Text></View>}
          </GlassView>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="All phases" on={phase === 0} onPress={() => setPhase(0)} />
        {([1, 2, 3, 4, 5] as Phase[]).map(ph => (
          <Chip key={ph} label={PHASES[ph].short} on={phase === ph} onPress={() => setPhase(phase === ph ? 0 : ph)} color={PHASE_COLOR[ph]} />
        ))}
      </ScrollView>
      <View style={styles.segment}>
        {(['all', 'todo', 'done', 'today'] as Status[]).map(s => (
          <Pressable key={s} onPress={() => { haptic.select(); setStatus(s); }} style={[styles.segBtn, status === s && styles.segOn]}>
            <Text style={[styles.segText, status === s && styles.segTextOn]}>
              {s === 'all' ? 'All' : s === 'todo' ? 'To do' : s === 'done' ? 'Done' : 'Today'}
            </Text>
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
        ListHeaderComponentStyle={{ marginBottom: 12 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPad + 16, gap: 10 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={12}
        renderItem={({ item: e }) => {
          const done = !!p.done[e.n];
          return (
            <Pressable onPress={() => { haptic.nav(); setOpen(e); }} accessibilityRole="button" accessibilityLabel={`Episode ${e.n}: ${e.name}`}>
              {({ pressed }) => (
                <GlassView radius={R.lg} style={[styles.row, pressed && { opacity: 0.8 }]}>
                  <View style={[styles.num, { borderColor: alpha(PHASE_COLOR[e.phase], 0.7) }, done && styles.numDone]}>
                    {done ? <IconCheck size={15} color={C.bg} strokeWidth={3} /> : <Text style={styles.numText}>{e.n}</Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Highlight text={e.name} q={query} style={[styles.rowName, done && { color: C.ink2 }]} lines={1} />
                    <Highlight
                      text={e.review ? e.review.title : e.segs.map(s => s.channel).filter((c, i, a) => a.indexOf(c) === i).join(' · ')}
                      q={query}
                      style={styles.rowSub}
                      lines={1}
                    />
                    <View style={styles.rowMeta}>
                      <View style={[styles.dot, { backgroundColor: PHASE_COLOR[e.phase] }]} />
                      <Text style={styles.rowMetaText}>{TOPIC_LABEL[e.topic]} · {e.review ? '~20 min' : fmtMins(e.secs)}</Text>
                      {todays.includes(e.n) && <Text style={styles.todayTag}>Today</Text>}
                    </View>
                  </View>
                  <IconChevron size={16} color={C.faint} />
                </GlassView>
              )}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <IconSearch size={34} color={C.faint} />
            <Text style={styles.emptyTitle}>Nothing matches</Text>
            <Text style={styles.emptySub}>Try a different word, or loosen the filters.</Text>
            {anyFilter && (
              <Pressable onPress={clear} style={styles.clearBtn}><Text style={styles.clearText}>Clear filters</Text></Pressable>
            )}
          </View>
        }
      />

      {/* Episode detail: the same flip card as Home. */}
      <Modal visible={!!open} transparent animationType="fade" onRequestClose={() => setOpen(null)} statusBarTranslucent navigationBarTranslucent>
        <Pressable style={styles.scrim} onPress={() => setOpen(null)} accessibilityLabel="Close" />
        {open && (
          <View style={styles.detail} pointerEvents="box-none">
            <EpisodeCard ep={open} done={!!p.done[open.n]} onToggle={toggle} onWatch={onWatch} wide height={340} />
            <Text style={styles.detailHint}>Tap the card to flip · hold to mark {p.done[open.n] ? 'not done' : 'done'}</Text>
          </View>
        )}
        <PartsSheet ep={parts} onClose={() => setParts(null)} />
      </Modal>

      {/* More filters */}
      <Modal visible={sheet} transparent animationType="fade" onRequestClose={() => setSheet(false)} statusBarTranslucent navigationBarTranslucent>
        <Pressable style={styles.scrim} onPress={() => setSheet(false)} accessibilityLabel="Close" />
        <View style={[styles.sheetWrap, { paddingBottom: insets.bottom + 16 }]} pointerEvents="box-none">
          <GlassView radius={R.xl + 4} style={styles.sheet}>
            <View style={styles.grab} />
            <Text style={styles.sheetTitle}>Filters</Text>
            <Text style={styles.sheetLabel}>Type</Text>
            <View style={styles.wrapRow}>
              {(['all', 'video', 'review'] as Kind[]).map(k => (
                <Chip key={k} label={k === 'all' ? 'Everything' : k === 'video' ? 'Videos' : 'Reviews'} on={kind === k} onPress={() => setKind(k)} />
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
              <Pressable onPress={() => { haptic.undo(); setKind('all'); setLen('all'); setSort('plan'); }} style={styles.sheetGhost}>
                <Text style={styles.sheetGhostText}>Reset</Text>
              </Pressable>
              <Pressable onPress={() => setSheet(false)} style={styles.sheetPrimary}>
                <Text style={styles.sheetPrimaryText}>Show {results.length} episodes</Text>
              </Pressable>
            </View>
          </GlassView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  title: { color: C.ink, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  count: { color: C.muted, fontSize: 13, fontVariant: ['tabular-nums'] },
  searchRow: { flexDirection: 'row', gap: 10 },
  inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, height: 48 },
  input: { flex: 1, color: C.ink, fontSize: 15.5, paddingVertical: 0 },
  filterBtn: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 7, right: 7, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: C.bg, fontSize: 10, fontWeight: '800' },
  chips: { gap: 8, paddingRight: 16 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 13, height: 34, borderRadius: R.pill, borderWidth: 1, borderColor: C.line, backgroundColor: 'rgba(255,255,255,0.04)' },
  chipOn: { backgroundColor: C.ink, borderColor: C.ink },
  chipText: { color: C.ink2, fontSize: 13.5, fontWeight: '600' },
  chipTextOn: { color: C.bg },
  dot: { width: 8, height: 8, borderRadius: 4 },
  segment: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: R.md, padding: 3, borderWidth: 1, borderColor: C.line },
  segBtn: { flex: 1, height: 34, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: 'rgba(139,147,255,0.25)' },
  segText: { color: C.muted, fontSize: 13.5, fontWeight: '600' },
  segTextOn: { color: C.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, paddingRight: 14 },
  num: { width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  numDone: { backgroundColor: C.good, borderColor: C.good },
  numText: { color: C.ink, fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  rowName: { color: C.ink, fontSize: 15.5, fontWeight: '700' },
  rowSub: { color: C.muted, fontSize: 12.5, marginTop: 2 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  rowMetaText: { color: C.faint, fontSize: 12 },
  todayTag: { color: C.accent, fontSize: 11, fontWeight: '700', marginLeft: 4, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6, backgroundColor: C.accentWash, overflow: 'hidden' },
  hit: { color: '#FFFFFF', backgroundColor: 'rgba(139,147,255,0.45)' },
  empty: { alignItems: 'center', paddingTop: 50, gap: 8 },
  emptyTitle: { color: C.ink, fontSize: 17, fontWeight: '700', marginTop: 6 },
  emptySub: { color: C.muted, fontSize: 13.5 },
  clearBtn: { marginTop: 10, paddingHorizontal: 18, height: 40, borderRadius: R.pill, backgroundColor: C.accentWash, justifyContent: 'center' },
  clearText: { color: C.accent, fontWeight: '700' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(4,6,14,0.72)' },
  detail: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  detailHint: { color: C.muted, fontSize: 12.5, textAlign: 'center', marginTop: 14 },
  sheetWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 12 },
  sheet: { padding: 18, paddingTop: 10 },
  grab: { alignSelf: 'center', width: 38, height: 4, borderRadius: 2, backgroundColor: C.line2, marginBottom: 12 },
  sheetTitle: { color: C.ink, fontSize: 20, fontWeight: '800' },
  sheetLabel: { color: C.muted, fontSize: 12.5, fontWeight: '700', marginTop: 16, marginBottom: 8, letterSpacing: 0.4, textTransform: 'uppercase' },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 22 },
  sheetGhost: { height: 48, paddingHorizontal: 20, borderRadius: R.md, borderWidth: 1, borderColor: C.line2, justifyContent: 'center' },
  sheetGhostText: { color: C.ink2, fontWeight: '700', fontSize: 15 },
  sheetPrimary: { flex: 1, height: 48, borderRadius: R.md, backgroundColor: C.accent2, alignItems: 'center', justifyContent: 'center' },
  sheetPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
