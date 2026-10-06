import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { BlurTargetView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from './src/lib/store';
import { TabBar, Tab } from './src/components/TabBar';
import { Home } from './src/screens/Home';
import { Search } from './src/screens/Search';
import { Progress } from './src/screens/Progress';
import { C } from './src/theme';
import { Ambient } from './src/components/Ambient';
import { BlurTargetContext } from './src/components/Glass';
import { Opening } from './src/components/Opening';

SplashScreen.preventAutoHideAsync().catch(() => {});
SystemUI.setBackgroundColorAsync(C.bg).catch(() => {});

function Shell() {
  const { ready } = useStore();
  const [tab, setTab] = useState<Tab>('home');
  const [intro, setIntro] = useState(true);
  const env = useRef<View>(null);
  const insets = useSafeAreaInsets();

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
    <BlurTargetContext.Provider value={env}>
    <View style={styles.root}>
      {/* Layer 1–2: the environment. Every glass surface blurs this one fixed layer. */}
      <BlurTargetView ref={env} style={StyleSheet.absoluteFill}>
        <Ambient />
      </BlurTargetView>
      {ready && tab === 'home' && <Home />}
      {ready && tab === 'search' && <Search />}
      {ready && tab === 'progress' && <Progress />}
      {/* Content fades out under the status bar instead of colliding with the clock. */}
      <LinearGradient pointerEvents="none" colors={['rgba(5,6,10,0.92)', 'rgba(5,6,10,0)']} style={[styles.topFade, { height: insets.top + 18 }]} />
      {ready && <TabBar tab={tab} onChange={setTab} />}
      {intro && <Opening onDone={() => setIntro(false)} />}
    </View>
    </BlurTargetContext.Provider>
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
  topFade: { position: 'absolute', top: 0, left: 0, right: 0 },
});
