import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="forget-password" options={{ title: "忘记密码" }} />
      <Stack.Screen name="create-password" options={{ title: "设置密码" }} />
      <Stack.Screen name="sign-in" options={{ title: "登录" }} />
      <Stack.Screen name="sign-up" options={{ title: "注册" }} />
    </Stack>
  );
}