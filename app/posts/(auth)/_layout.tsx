import { Stack } from 'expo-router';
import AnonyPage from '@/app/anony';
import { useAuth } from '@/components/auth-provider';

export default function Root() {
  const { user } = useAuth();
  return user ? <Stack screenOptions={{ headerShown: false }} /> : <AnonyPage />;
}
