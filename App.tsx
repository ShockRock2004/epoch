import React, { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from './src/lib/store';
import { TabBar, Tab } from './src/components/TabBar';
import { Home } from './src/screens/Home';
import { Search } from './src/screens/Search';
import { Progress } from './src/screens/Progress';
import { C, BG_GRADIENT, BG_LOCATIONS } from './src/theme';
import { Opening } from './src/components/Opening';

SplashScreen.preventAutoHideAsync().catch(() => {});
SystemUI.setBackgroundColorAsync(C.bg).catch(() => {});

function Shell() {
  const { ready } = useStore();
  const [tab, setTab] = useState<Tab>('home');
  const [intro, setIntro] = useState(true);

  // The native splash is a plain background; the opening animation takes over on the first frame.
  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => { SplashScreen.hideAsync().catch(() => {}); }));
  }, []);

  // Android back: Search/Progress → Home → exit.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (tab !== 'home') { setTab('home'); return true; }
      return false;
    });
    return () => sub.remove();
  }, [tab]);


  return (
    <View style={styles.root}>
      <LinearGradient colors={BG_GRADIENT} locations={BG_LOCATIONS} style={StyleSheet.absoluteFill} />
      {ready && tab === 'home' && <Home />}
      {ready && tab === 'search' && <Search />}
      {ready && tab === 'progress' && <Progress />}
      {ready && <TabBar tab={tab} onChange={setTab} />}
      {intro && <Opening onDone={() => setIntro(false)} />}
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
