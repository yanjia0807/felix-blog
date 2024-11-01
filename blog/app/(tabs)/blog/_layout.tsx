import { Stack } from 'expo-router';
import { ProfileAvatar } from "@/components/ProfileAvatar";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "发现", headerShown: false }}
      />
      <Stack.Screen name="create" options={{ title: "记录" }} />
      <Stack.Screen name="detail" options={{}} />
    </Stack>
  );
}