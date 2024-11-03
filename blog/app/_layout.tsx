import "@/global.css";
import React from "react";
import { Stack } from "expo-router";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/auth-context";
import { KeyboardProvider } from "react-native-keyboard-controller";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <GestureHandlerRootView className="flex-1">
      <KeyboardProvider>
        <BottomSheetModalProvider>
          <QueryClientProvider client={queryClient}>
            <GluestackUIProvider mode="light">
              <AuthProvider>
                <Stack
                  initialRouteName="tabs"
                  screenOptions={{ headerShown: false }}
                >
                  <Stack.Screen name="(tabs)" options={{}} />
                  <Stack.Screen
                    name="(auth)"
                    options={{ presentation: "modal" }}
                  />
                </Stack>
              </AuthProvider>
            </GluestackUIProvider>
          </QueryClientProvider>
        </BottomSheetModalProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
