import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Episode } from '../data/plan';
import { C, R, fmtClock } from '../theme';
import { GlassView } from './GlassView';
import { IconPlay } from './Icons';
import { openSeg } from '../lib/youtube';
import { haptic } from '../lib/haptics';

/** Picks which part of a multi-video episode to open. */
export function PartsSheet({ ep, onClose }: { ep: Episode | null; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={!!ep} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <Pressable style={styles.scrim} onPress={onClose} accessibilityLabel="Close" />
      {ep && (
        <View style={[styles.wrap, { paddingBottom: insets.bottom + 16 }]} pointerEvents="box-none">
          <GlassView radius={R.xl + 4} style={styles.sheet}>
            <View style={styles.grab} />
            <Text style={styles.eyebrow}>Episode {ep.n} · {ep.segs.length} parts</Text>
            <Text style={styles.title}>{ep.name}</Text>
            <View style={{ gap: 10, marginTop: 14 }}>
              {ep.segs.map((s, i) => (
                <Pressable
                  key={i}
                  onPress={() => { haptic.nav(); openSeg(s); onClose(); }}
                  style={({ pressed }) => [styles.part, pressed && { backgroundColor: 'rgba(255,255,255,0.12)' }]}
                  accessibilityRole="link"
                >
                  <View style={styles.play}><IconPlay size={14} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.partTitle} numberOfLines={2}>{s.title}</Text>
                    <Text style={styles.partMeta}>
                      {s.channel} · {s.ranged ? `${fmtClock(s.start)}–${s.end === s.len ? 'end' : fmtClock(s.end)}` : fmtClock(s.len)}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </GlassView>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(4,6,14,0.6)' },
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 12 },
  sheet: { padding: 18, paddingTop: 10 },
  grab: { alignSelf: 'center', width: 38, height: 4, borderRadius: 2, backgroundColor: C.line2, marginBottom: 12 },
  eyebrow: { color: C.muted, fontSize: 12, fontWeight: '600' },
  title: { color: C.ink, fontSize: 19, fontWeight: '700', marginTop: 4 },
  part: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: R.md, backgroundColor: 'rgba(255,255,255,0.06)' },
  play: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.accent2, alignItems: 'center', justifyContent: 'center', paddingLeft: 2 },
  partTitle: { color: C.ink, fontSize: 14, fontWeight: '600', lineHeight: 19 },
  partMeta: { color: C.muted, fontSize: 12.5, marginTop: 2, fontVariant: ['tabular-nums'] },
});
