import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { useUpdateExpoPushToken } from '@/features/push-notification/api/use-update-expo-push-token';
import { usePushNotification } from '@/features/push-notification/components/push-notification-provider';
import { useAuth } from '../components/auth-provider';

export const useLogout = () => {
  const { removeAccessToken, removeUser } = useAuth();
  const { expoPushToken, setExpoPushToken } = usePushNotification();
  const queryClient = useQueryClient();
  const { unRegisterUserPushToken } = useUpdateExpoPushToken();

  const logout = async () => {
    removeAccessToken();
    removeUser();
    queryClient.clear();
    await SecureStore.deleteItemAsync('accessToken');
    await unRegisterUserPushToken.mutate(
      {
        documentId: expoPushToken.documentId,
        deviceId: expoPushToken.deviceId,
      },
      {
        onSuccess(data) {
          setExpoPushToken(data);
        },
      },
    );
  };

  return { logout };
};
