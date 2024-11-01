import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "我的" }} />
      <Stack.Screen name="edit" options={{ title: "编辑" }} />
    </Stack>
  );
}
