import '@/global.css';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { AuthProvider } from '@/components/auth-context';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';

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
  return (
    <GestureHandlerRootView className="flex-1">
      <QueryClientProvider client={queryClient}>
        <KeyboardProvider>
          <GluestackUIProvider mode="light">
            <BottomSheetModalProvider>
              <AuthProvider>
                <Stack initialRouteName="tabs" screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" options={{}} />
                  <Stack.Screen name="(auth)" options={{ presentation: 'modal' }} />
                </Stack>
              </AuthProvider>
            </BottomSheetModalProvider>
          </GluestackUIProvider>
        </KeyboardProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
