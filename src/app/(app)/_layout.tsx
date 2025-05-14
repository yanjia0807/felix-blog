import { Slot } from 'expo-router';
import { useAuth } from '@/components/auth-provider';
import AnonyPage from '../anony';

export default function Root() {
  const { user } = useAuth();
  return user ? <Slot /> : <AnonyPage />;
}
