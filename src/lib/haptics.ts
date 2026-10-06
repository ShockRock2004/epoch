import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// Same approach as Grindz: Android goes through performHapticFeedback, which is tuned per
// device and obeys the system touch-feedback setting. Names are semantic, not strengths.
const A = Haptics.AndroidHaptics;
const isAndroid = Platform.OS === 'android';
const api = isAndroid && typeof Platform.Version === 'number' ? Platform.Version : 0;
const RICH = api >= 34;
const MODERN = api >= 30;

const fire = (t: Haptics.AndroidHaptics) => { Haptics.performAndroidHapticsAsync(t).catch(() => {}); };
const fallback = (s: Haptics.ImpactFeedbackStyle) => { Haptics.impactAsync(s).catch(() => {}); };

export const haptic = {
  /** Filter chips, flips, segmented choices. */
  select() { isAndroid ? fire(RICH ? A.Segment_Tick : A.Clock_Tick) : fallback(Haptics.ImpactFeedbackStyle.Light); },
  /** Tab switch, sheet open/close. */
  nav() { isAndroid ? fire(A.Context_Click) : fallback(Haptics.ImpactFeedbackStyle.Light); },
  /** A long-press started filling. */
  hold() { isAndroid ? fire(MODERN ? A.Gesture_Start : A.Clock_Tick) : fallback(Haptics.ImpactFeedbackStyle.Light); },
  /** An episode was marked done. */
  success() { isAndroid ? fire(MODERN ? A.Confirm : A.Virtual_Key) : fallback(Haptics.ImpactFeedbackStyle.Medium); },
  /** An episode was un-marked, or progress reset. */
  undo() { isAndroid ? fire(RICH ? A.Toggle_Off : A.Clock_Tick) : fallback(Haptics.ImpactFeedbackStyle.Light); },
  warn() { isAndroid ? fire(MODERN ? A.Reject : A.Long_Press) : fallback(Haptics.ImpactFeedbackStyle.Heavy); },
};
