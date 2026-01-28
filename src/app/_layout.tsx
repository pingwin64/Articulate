import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
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
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
            animation: 'fade',
            animationDuration: 200,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="reading" />
          <Stack.Screen name="complete" />
          <Stack.Screen
            name="settings"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
