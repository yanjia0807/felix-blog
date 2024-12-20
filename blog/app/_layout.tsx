import '@/global.css';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { AuthProvider } from '@/components/auth-context';
import { PreferencesProvider, Theme } from '@/components/preferences-provider';
import { useColorScheme } from 'react-native';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { DarkTheme, DefaultTheme } from '@/constants/router-theme';
import { BottomSheet } from '@/components/ui/bottomsheet';
import SocketProvider from '@/components/socket-context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 0,
    },
  },
});

export default function RootLayout() {
  const [theme, setTheme] = useState<Theme>();
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useLayoutEffect(() => {
    const loadTheme = async () => {
      const savedTheme = (await AsyncStorage.getItem('theme')) as Theme;
      if (savedTheme) {
        setTheme(savedTheme);
        AsyncStorage.setItem('theme', savedTheme);
      } else {
        setTheme(colorScheme || 'light');
      }
    };

    loadTheme();
  }, []);

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    if (newTheme) {
      AsyncStorage.setItem('theme', newTheme);
    } else {
      AsyncStorage.removeItem('theme');
    }
  };

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <QueryClientProvider client={queryClient}>
        <KeyboardProvider>
          <BottomSheetModalProvider>
            <BottomSheet>
            <PreferencesProvider theme={theme} updateTheme={updateTheme}>
              <NavigationThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
                <GluestackUIProvider mode={theme}>
                  <AuthProvider>
                    <SocketProvider>
                      <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(tabs)" options={{}} />
                        <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
                        <Stack.Screen name="+not-found" />
                      </Stack>
                    </SocketProvider>
                    <StatusBar style="auto" />
                  </AuthProvider>
                </GluestackUIProvider>
              </NavigationThemeProvider> 
            </PreferencesProvider>
            </BottomSheet>
          </BottomSheetModalProvider>
        </KeyboardProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
