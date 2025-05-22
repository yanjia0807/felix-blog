import { Stack } from 'expo-router';
import AnonyPage from '@/app/anony';
import { useAuth } from '@/features/auth/components/auth-provider';

export default function UserAuthLayout() {
  const { user } = useAuth();

  return user ? <Stack screenOptions={{ headerShown: false }} /> : <AnonyPage />;
}
