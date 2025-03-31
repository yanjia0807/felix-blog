import { Slot, Stack } from 'expo-router';
import { useAuth } from '@/components/auth-provider';
import AnonyPage from '../anony';

export default function Root() {
  const { isLogin } = useAuth();
  return isLogin ? <Stack /> : <AnonyPage />;
}
