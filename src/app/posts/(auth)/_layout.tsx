import { Stack } from 'expo-router';
import AnonyPage from '@/app/anony';
import { useAuth } from '@/features/auth/components/auth-provider';

export default function PostAuthLayout() {
  const { user } = useAuth();
  return user ? <Stack screenOptions={{ headerShown: false }} /> : <AnonyPage />;
}
