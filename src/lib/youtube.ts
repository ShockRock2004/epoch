import { Linking } from 'react-native';
import type { Seg } from '../data/plan';

// An https watch link is claimed by the YouTube app on Android, and falls back to the browser.
export const watchUrl = (s: Pick<Seg, 'id' | 'start'>) =>
  `https://www.youtube.com/watch?v=${s.id}${s.start ? `&t=${s.start}s` : ''}`;

export const openSeg = (s: Pick<Seg, 'id' | 'start'>) => Linking.openURL(watchUrl(s)).catch(() => {});
