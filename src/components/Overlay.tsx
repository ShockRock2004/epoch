import React, { useEffect, useId, useLayoutEffect, useSyncExternalStore } from 'react';
import { BackHandler, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut, SlideInDown, SlideOutDown, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, FONT, R, S } from '../theme';
import { Glass } from './Glass';
import { IconCheck } from './Icons';
import { TAB_BAR_H } from './TabBar';

/*
 * Why not <Modal>: on Android a Modal is a separate window, and glass there has nothing to blur.
 * Portals render in the app's own window, above the content layer, so sheets and headers frost it.
 */

type Layer = 'chrome' | 'sheet' | 'toast';
type Entry = { id: string; layer: Layer; node: React.ReactNode };

let entries: Entry[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
const snapshot = () => entries;

function put(id: string, layer: Layer, node: React.ReactNode) {
  const i = entries.findIndex(e => e.id === id);
  entries = i < 0 ? [...entries, { id, layer, node }] : entries.map(e => (e.id === id ? { id, layer, node } : e));
  emit();
}
function drop(id: string) {
  entries = entries.filter(e => e.id !== id);
  emit();
}

/** Renders its children in the overlay host (outside the blurred content) instead of in place. */
export function Portal({ layer, children }: { layer: Layer; children: React.ReactNode }) {
  const id = useId();
  useLayoutEffect(() => { put(id, layer, children); });
  useEffect(() => () => drop(id), [id]);
  return null;
}

export function OverlayHost({ layer }: { layer: Layer }) {
  const all = useSyncExternalStore(subscribe, snapshot);
  return <>{all.filter(e => e.layer === layer).map(e => <React.Fragment key={e.id}>{e.node}</React.Fragment>)}</>;
}

/** A slide without a fade: animating opacity above a BlurView makes Android re-layer and flash the blur. */
export const slideX = (dx: number) => () => {
  'worklet';
  return {
    initialValues: { transform: [{ translateX: dx }] },
    animations: { transform: [{ translateX: withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) }) }] },
  };
};

type SheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Style of the glass panel. */
  style?: StyleProp<ViewStyle>;
  /** Style of the positioning wrapper (e.g. a fixed top for a tall sheet). */
  wrapStyle?: StyleProp<ViewStyle>;
};

/** A bottom sheet of real glass: the app recedes behind a soft frost, the sheet frosts it harder. */
export function Sheet({ visible, onClose, children, style, wrapStyle }: SheetProps) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => { onClose(); return true; });
    return () => sub.remove();
  }, [visible, onClose]);

  return (
    <Portal layer="sheet">
      {visible && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(160)} style={StyleSheet.absoluteFill}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close">
              <Glass material="scrim" radius={0} style={StyleSheet.absoluteFill} />
            </Pressable>
          </Animated.View>
          <Animated.View
            entering={SlideInDown.duration(300).easing(Easing.out(Easing.cubic))}
            exiting={SlideOutDown.duration(220)}
            style={[styles.wrap, { paddingBottom: insets.bottom + S.md }, wrapStyle]}
            pointerEvents="box-none"
          >
            <Glass material="sheet" radius={R.lg} style={style}>{children}</Glass>
          </Animated.View>
        </View>
      )}
    </Portal>
  );
}

/* ---------- Snackbar: every state change can be undone ---------- */

type Toast = { id: number; text: string; action?: { label: string; onPress: () => void } } | null;
let current: Toast = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const toastListeners = new Set<() => void>();
const setToast = (t: Toast) => { current = t; toastListeners.forEach(l => l()); };

export const toast = {
  show(text: string, action?: { label: string; onPress: () => void }) {
    clearTimeout(timer);
    setToast({ id: Date.now(), text, action });
    timer = setTimeout(() => setToast(null), 4000);
  },
  hide() { clearTimeout(timer); setToast(null); },
};

export function ToastHost() {
  const t = useSyncExternalStore(l => { toastListeners.add(l); return () => { toastListeners.delete(l); }; }, () => current);
  const insets = useSafeAreaInsets();
  if (!t) return null;
  return (
    <View pointerEvents="box-none" style={[styles.toastWrap, { bottom: TAB_BAR_H + Math.max(insets.bottom, S.md) + S.sm }]}>
      <Animated.View key={t.id} entering={SlideInDown.duration(260).easing(Easing.out(Easing.cubic))} exiting={SlideOutDown.duration(200)}>
        <Glass material="dock" radius={R.md}>
          <View style={styles.toast} accessibilityLiveRegion="polite">
            <IconCheck size={15} color={C.accent} strokeWidth={2.4} />
            <Text style={styles.toastText} numberOfLines={2}>{t.text}</Text>
            {t.action && (
              <Pressable
                onPress={() => { t.action!.onPress(); toast.hide(); }}
                hitSlop={8}
                style={({ pressed }) => [styles.toastBtn, pressed && { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                accessibilityRole="button"
              >
                <Text style={styles.toastBtnText}>{t.action.label}</Text>
              </Pressable>
            )}
          </View>
        </Glass>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: S.md },
  toastWrap: { position: 'absolute', left: S.xl, right: S.xl },
  toast: { flexDirection: 'row', alignItems: 'center', gap: S.md, minHeight: 52, paddingLeft: S.lg, paddingRight: S.sm },
  toastText: { flex: 1, color: C.ink, fontFamily: FONT[500], fontSize: 13.5, lineHeight: 19 },
  toastBtn: { minHeight: 40, paddingHorizontal: S.md, borderRadius: R.sm, justifyContent: 'center' },
  toastBtnText: { color: C.accent, fontFamily: FONT[700], fontSize: 13.5 },
});
