import '@/global.css';
import 'expo-dev-client';
import React, { useEffect, useState } from 'react';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ThemeProvider as NavigationThemeProvider,
  useNavigationState,
} from '@react-navigation/native';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { AuthProvider } from '@/components/auth-provider';
import { PreferencesProvider, Theme } from '@/components/preferences-provider';
import SocketProvider from '@/components/socket-provider';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { DarkTheme, DefaultTheme } from '@/constants/router-theme';

// const isHermes = () => !!global.HermesInternal;
// console.log('isHermes', isHermes());
LogBox.ignoreAllLogs(true);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      // 🎉 only show error toasts if we already have data in the cache
      // which indicates a failed background update
      if (query.state.data !== undefined) {
        console.log('同步数据异常', error.message);
      }
    },
  }),
});

export default function RootLayout() {
  const [theme, setTheme] = useState<Theme>();
  const colorScheme = useColorScheme();

  const state = useNavigationState((state) => state);
  console.log(state);

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
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
  }, [colorScheme]);

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
      <GluestackUIProvider mode={theme}>
        <KeyboardProvider>
          <QueryClientProvider client={queryClient}>
            <BottomSheetModalProvider>
              <AuthProvider>
                <PreferencesProvider theme={theme} updateTheme={updateTheme}>
                  <NavigationThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
                    <SocketProvider>
                      <StatusBar style="auto" />
                      <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="(modal)" options={{ presentation: 'modal' }} />
                      </Stack>
                    </SocketProvider>
                    <StatusBar style="auto" />
                  </NavigationThemeProvider>
                </PreferencesProvider>
              </AuthProvider>
            </BottomSheetModalProvider>
          </QueryClientProvider>
        </KeyboardProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}
