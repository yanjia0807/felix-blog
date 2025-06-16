import { usePushNotification } from '@/features/push-notification/components/push-notification-provider';
import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

export const useLogout = () => {
  const { unRegisterPushNotification } = usePushNotification();
  const queryClient = useQueryClient();

  const logout = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await queryClient.invalidateQueries({ queryKey: ['users', 'detail', 'me'] });
    queryClient.clear();
    unRegisterPushNotification();
  };

  return { logout };
};
