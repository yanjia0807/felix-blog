import { Redirect, Stack, useRouter } from 'expo-router';
import { useAuth } from '@/components/auth-provider';

export default function ChatsLayout() {
  const { user }: any = useAuth();
  return user ? <Stack /> : <Redirect href="/auth" />;
}
