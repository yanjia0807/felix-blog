import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{title:"发现"}} />
      <Stack.Screen name="create" options={{title:"创建博客"}} />
      <Stack.Screen name="detail" options={{}} />
    </Stack>
  );
}