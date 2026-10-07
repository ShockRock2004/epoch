import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { C, FONT, R, S } from '../theme';
import { IconChevron } from './Icons';
import { haptic } from '../lib/haptics';

/** 1 … 4 5 6 … 10 — always the first, the last, and the current page's neighbours. */
export const pageWindow = (page: number, pages: number): (number | '…')[] => {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i);
  const keep = new Set([0, pages - 1, page - 1, page, page + 1]);
  const out: (number | '…')[] = [];
  for (let i = 0; i < pages; i++) {
    if (keep.has(i)) out.push(i);
    else if (out[out.length - 1] !== '…') out.push('…');
  }
  return out;
};

export function Pager({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  const go = (p: number) => {
    if (p < 0 || p >= pages || p === page) return;
    haptic.select();
    onChange(p);
  };
  return (
    <View style={styles.row}>
        <Arrow dir="left" enabled={page > 0} onPress={() => go(page - 1)} />
        <View style={styles.nums}>
          {pageWindow(page, pages).map((p, i) =>
            p === '…' ? (
              <Text key={`e${i}`} style={styles.ellipsis}>…</Text>
            ) : (
              <Pressable
                key={p}
                onPress={() => go(p)}
                style={[styles.num, p === page && styles.numOn]}
                accessibilityRole="button"
                accessibilityState={{ selected: p === page }}
                accessibilityLabel={`Page ${p + 1}`}
              >
                <Text style={[styles.numText, p === page && styles.numTextOn]}>{p + 1}</Text>
              </Pressable>
            ),
          )}
        </View>
        <Arrow dir="right" enabled={page < pages - 1} onPress={() => go(page + 1)} />
    </View>
  );
}

function Arrow({ dir, enabled, onPress }: { dir: 'left' | 'right'; enabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!enabled}
      hitSlop={8}
      style={({ pressed }) => [styles.arrow, !enabled && { opacity: 0.3 }, pressed && { backgroundColor: 'rgba(255,255,255,0.18)' }]}
      accessibilityRole="button"
      accessibilityLabel={dir === 'left' ? 'Previous page' : 'Next page'}
    >
      <IconChevron dir={dir} size={17} color={C.ink} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: S.sm },
  nums: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  num: { minWidth: 40, height: 40, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  numOn: { backgroundColor: C.light },
  numText: { color: C.ink2, fontFamily: FONT[500], fontSize: 13, fontVariant: ['tabular-nums'] },
  numTextOn: { color: C.onLight, fontFamily: FONT[800] },
  ellipsis: { color: C.ink2, fontFamily: FONT[500], width: 18, textAlign: 'center' },
  arrow: { width: 44, height: 44, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center' },
});
