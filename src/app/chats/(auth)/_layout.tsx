import AnonyPage from '@/app/anony';
import { useAuth } from '@/features/auth/components/auth-provider';
import { Stack } from 'expo-router';

export default function ChatAuthLayout() {
  const { user } = useAuth();
  return user ? <Stack /> : <AnonyPage />;
}
