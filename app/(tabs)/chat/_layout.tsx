import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/components/auth-context';

export default function ChatsLayout() {
  const { user }: any = useAuth();

  return user ? <Stack /> : <Redirect href="/anonymous" />;
}
