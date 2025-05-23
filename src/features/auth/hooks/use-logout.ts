import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { usePushNotification } from '@/features/push-notification/components/push-notification-provider';
import { useAuth } from '../components/auth-provider';

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { removeAccessToken } = useAuth();
  const { unRegisterPushNotification } = usePushNotification();

  const logout = async () => {
    removeAccessToken();
    queryClient.clear();
    await SecureStore.deleteItemAsync('accessToken');
    await unRegisterPushNotification();
  };

  return { logout };
};
