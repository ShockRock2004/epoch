import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import { BlurTargetView } from 'expo-blur';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from './src/lib/store';
import { TabBar, Tab } from './src/components/TabBar';
import { Home } from './src/screens/Home';
import { Search } from './src/screens/Search';
import { Progress } from './src/screens/Progress';
import { C } from './src/theme';
import { useSharedValue } from 'react-native-reanimated';
import { Backdrop, ScrollYContext } from './src/components/Backdrop';
import { BackdropTargetContext, ContentTargetContext, Glass } from './src/components/Glass';
import { OverlayHost, ToastHost } from './src/components/Overlay';
import { Opening } from './src/components/Opening';

SplashScreen.preventAutoHideAsync().catch(() => {});
SystemUI.setBackgroundColorAsync(C.bg).catch(() => {});

function Shell() {
  const { ready } = useStore();
  const [tab, setTab] = useState<Tab>('home');
  const [intro, setIntro] = useState(true);
  const backdrop = useRef<View>(null);
  const content = useRef<View>(null);
  const scrollY = useSharedValue(0);
  const insets = useSafeAreaInsets();

  // Each screen starts at the top, so the backdrop does too.
  useEffect(() => { scrollY.value = 0; }, [tab, scrollY]);

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
    <ScrollYContext.Provider value={scrollY}>
    <BackdropTargetContext.Provider value={backdrop}>
    <ContentTargetContext.Provider value={content}>
    <View style={styles.root}>
      {/*
        Two blur layers. Cards blur only the backdrop (they scroll inside the content, and a blur
        can't sample the layer it lives in). Everything floating above (tab bar, headers, sheets)
        blurs the whole content layer, so cards visibly frost as they pass underneath.
      */}
      <BlurTargetView ref={content} style={StyleSheet.absoluteFill}>
        <BlurTargetView ref={backdrop} style={StyleSheet.absoluteFill}>
          <Backdrop />
        </BlurTargetView>
        {ready && tab === 'home' && <Home />}
        {ready && tab === 'search' && <Search />}
        {ready && tab === 'progress' && <Progress />}
      </BlurTargetView>
      {/* Frosted status bar: content slides under the clock instead of colliding with it. */}
      <Glass material="header" radius={0} style={[styles.status, { height: insets.top }]} />
      <OverlayHost layer="chrome" />
      {ready && <TabBar tab={tab} onChange={setTab} />}
      <ToastHost />
      <OverlayHost layer="sheet" />
      {intro && <Opening onDone={() => setIntro(false)} />}
    </View>
    </ContentTargetContext.Provider>
    </BackdropTargetContext.Provider>
    </ScrollYContext.Provider>
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
  status: { position: 'absolute', top: 0, left: 0, right: 0 },
});
