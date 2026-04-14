import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppDebugOverlay from '@/components/AppDebugOverlay';
import ErrorBoundary from '@/components/ErrorBoundary';
import AppLoaderProvider from '@/components/Loader';
import { LanguageProvider } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <LanguageProvider>
          <AppLoaderProvider>
            <ErrorBoundary>
              <Stack 
                screenOptions={{ 
                  headerShown: false,
                  animation: 'fade',
                }} 
              />
              <AppDebugOverlay />
            </ErrorBoundary>
            <StatusBar style="auto" />
          </AppLoaderProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
