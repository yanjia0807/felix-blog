import '@/global.css';
import 'expo-dev-client';
import React, { useEffect, useState } from 'react';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Provider as ReduxProvider } from 'react-redux';
import { PreferencesProvider, Theme } from '@/components/preferences-provider';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { DarkTheme, DefaultTheme } from '@/constants/router-theme';
import { AuthProvider } from '@/features/auth/components/auth-provider';
import { PushNotificationProvider } from '@/features/push-notification/components/push-notification-provider';
import { SocketProvider } from '@/features/socket/components/socket-provider';
import store from '@/store';

LogBox.ignoreAllLogs(true);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    },
  },
});

export default function RootLayout() {
  const [theme, setTheme] = useState<Theme>();
  const colorScheme = useColorScheme();

  // const state = useNavigationState((state) => state);
  // console.log(state);

  const [loaded] = useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
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
        <QueryClientProvider client={queryClient}>
          <ReduxProvider store={store}>
            <PushNotificationProvider>
              <AuthProvider>
                <SocketProvider>
                  <PreferencesProvider theme={theme} updateTheme={updateTheme}>
                    <BottomSheetModalProvider>
                      <KeyboardProvider>
                        <NavigationThemeProvider
                          value={theme === 'dark' ? DarkTheme : DefaultTheme}>
                          <StatusBar style="auto" />
                          <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                            <Stack.Screen name="(modal)" options={{ presentation: 'modal' }} />
                          </Stack>
                        </NavigationThemeProvider>
                      </KeyboardProvider>
                    </BottomSheetModalProvider>
                  </PreferencesProvider>
                </SocketProvider>
              </AuthProvider>
            </PushNotificationProvider>
          </ReduxProvider>
        </QueryClientProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}
