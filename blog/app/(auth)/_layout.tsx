import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: "登录" }} />
      <Stack.Screen name="register" options={{ title: "注册" }} />
      <Stack.Screen name="forget-password" options={{ title: "忘记密码" }} />
      <Stack.Screen name="reset-password" options={{ title: "设置密码" }} />
      <Stack.Screen name="email-confirmation" options={{ title: "验证成功" }} />
    </Stack>
  );
}