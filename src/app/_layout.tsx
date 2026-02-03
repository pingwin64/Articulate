import React, { useCallback, useEffect } from 'react';
import { View, StyleSheet, AccessibilityInfo } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  SourceSerif4_400Regular,
  SourceSerif4_600SemiBold,
  SourceSerif4_700Bold,
} from '@expo-google-fonts/source-serif-4';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_600SemiBold,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import {
  Literata_400Regular,
  Literata_600SemiBold,
  Literata_700Bold,
} from '@expo-google-fonts/literata';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '../hooks/useTheme';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useSettingsStore } from '../lib/store/settings';
import { initPurchases } from '../lib/purchases';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SourceSerif4_400Regular,
    SourceSerif4_600SemiBold,
    SourceSerif4_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_600SemiBold,
    JetBrainsMono_700Bold,
    Literata_400Regular,
    Literata_600SemiBold,
    Literata_700Bold,
  });

  const { colors, isDark } = useTheme();
  const setReduceMotion = useSettingsStore((s) => s.setReduceMotion);

  // Sync system reduce motion preference on mount
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (enabled) setReduceMotion(true);
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => setReduceMotion(enabled)
    );
    return () => subscription.remove();
  }, [setReduceMotion]);

  // Initialize RevenueCat
  useEffect(() => {
    initPurchases().catch(() => {
      // RevenueCat init may fail in dev/simulator — non-critical
    });
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <ErrorBoundary>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
            animation: 'fade',
            animationDuration: 200,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen
            name="reading"
            options={{
              headerShown: true,
              headerTransparent: true,
              headerTitle: '',
              headerShadowVisible: false,
              headerBackVisible: false,
            }}
          />
          <Stack.Screen name="complete" />
          <Stack.Screen
            name="settings"
            options={{
              animation: 'slide_from_right',
              headerShown: true,
              title: 'Profile',
              headerBackTitle: 'Home',
              headerStyle: { backgroundColor: colors.bg },
              headerTintColor: colors.primary,
              headerTitleStyle: { color: colors.primary },
            }}
          />
          <Stack.Screen name="paste" />
          <Stack.Screen
            name="library"
            options={{
              animation: 'slide_from_right',
              headerShown: true,
              title: 'My Library',
              headerBackTitle: 'Home',
              headerStyle: { backgroundColor: colors.bg },
              headerTintColor: colors.primary,
              headerTitleStyle: { color: colors.primary },
            }}
          />
          <Stack.Screen
            name="insights"
            options={{
              animation: 'slide_from_right',
              headerShown: true,
              title: 'Reading Insights',
              headerBackTitle: 'Home',
              headerStyle: { backgroundColor: colors.bg },
              headerTintColor: colors.primary,
              headerTitleStyle: { color: colors.primary },
            }}
          />
          <Stack.Screen
            name="achievements"
            options={{
              animation: 'slide_from_right',
              headerShown: true,
              title: 'Achievements',
              headerBackTitle: 'Profile',
              headerStyle: { backgroundColor: colors.bg },
              headerTintColor: colors.primary,
              headerTitleStyle: { color: colors.primary },
            }}
          />
          <Stack.Screen
            name="word-bank"
            options={{
              animation: 'slide_from_right',
              headerShown: true,
              title: 'My Words',
              headerBackTitle: 'Home',
              headerStyle: { backgroundColor: colors.bg },
              headerTintColor: colors.primary,
              headerTitleStyle: { color: colors.primary },
            }}
          />
          <Stack.Screen name="privacy" />
          <Stack.Screen name="tos" />
          <Stack.Screen name="quiz" />
          <Stack.Screen
            name="text-select"
            options={{
              presentation: 'formSheet',
              sheetGrabberVisible: true,
              sheetAllowedDetents: [0.5, 1.0],
            }}
          />
          <Stack.Screen
            name="paywall"
            options={{
              presentation: 'formSheet',
              sheetGrabberVisible: true,
              sheetAllowedDetents: [0.75, 1.0],
              contentStyle: { backgroundColor: 'transparent' },
            }}
          />
        </Stack>
        </ErrorBoundary>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
