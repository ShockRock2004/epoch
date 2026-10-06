import React, { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from './src/lib/store';
import { TabBar, Tab, TAB_BAR_H } from './src/components/TabBar';
import { Home } from './src/screens/Home';
import { Search } from './src/screens/Search';
import { Progress } from './src/screens/Progress';
import { C } from './src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});
SystemUI.setBackgroundColorAsync(C.bg).catch(() => {});

function Shell() {
  const { ready } = useStore();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('home');

  // Hide the splash on the second frame after the first real paint. No artificial delay.
  useEffect(() => {
    if (!ready) return;
    requestAnimationFrame(() => requestAnimationFrame(() => { SplashScreen.hideAsync().catch(() => {}); }));
  }, [ready]);

  // Android back: Search/Progress → Home → exit.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (tab !== 'home') { setTab('home'); return true; }
      return false;
    });
    return () => sub.remove();
  }, [tab]);

  if (!ready) return null;
  const bottomPad = TAB_BAR_H + Math.max(insets.bottom, 10) + 8;

  return (
    <View style={styles.root}>
      <LinearGradient colors={[C.bg, '#10162A', C.bg2]} style={StyleSheet.absoluteFill} />
      {tab === 'home' && <Home bottomPad={bottomPad} />}
      {tab === 'search' && <Search bottomPad={bottomPad} />}
      {tab === 'progress' && <Progress bottomPad={bottomPad} />}
      <TabBar tab={tab} onChange={setTab} />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="light" />
        <Shell />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
});
