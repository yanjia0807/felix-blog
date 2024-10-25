import { Stack } from "expo-router";

import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
export default function RootLayout() {
  return (
    <GestureHandlerRootView className="flex-1">
      <GluestackUIProvider mode="light">
        <BottomSheetModalProvider>
          <Stack initialRouteName="tabs" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{}} />
            <Stack.Screen name="(auth)" options={{ presentation: "modal" }} />
          </Stack>
        </BottomSheetModalProvider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  ); 
}
