import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { useUpdateExpoPushTokenMutation } from '@/features/push-notification/api/use-update-expo-push-token';
import { usePushNotification } from '@/features/push-notification/components/push-notification-provider';
import { useAuth } from '../components/auth-provider';

export const useLogout = () => {
  const { removeAccessToken } = useAuth();
  const { expoPushToken, setExpoPushToken } = usePushNotification();
  const queryClient = useQueryClient();
  const updateExpoPushTokenMutation = useUpdateExpoPushTokenMutation();

  const logout = async () => {
    queryClient.clear();
    removeAccessToken();
    await SecureStore.deleteItemAsync('accessToken');
    await updateExpoPushTokenMutation.mutate(
      {
        documentId: expoPushToken.documentId,
        data: {
          user: null,
        },
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
