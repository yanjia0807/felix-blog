import { QueryClient, useMutation } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { login } from '@/api';
import { useUpdateExpoPushToken } from '@/features/push-notification/api/use-update-expo-push-token';
import { usePushNotification } from '@/features/push-notification/components/push-notification-provider';
import { createFetchMeQuery } from '@/features/user/api/use-fetch-me';
import { useAuth } from '../components/auth-provider';

export const useLogin = () => {
  const queryClient = new QueryClient();
  const { setAccessToken, setUser } = useAuth();
  const { expoPushToken, setExpoPushToken } = usePushNotification();
  const { registerUserPushToken } = useUpdateExpoPushToken();

  return useMutation({
    mutationFn: (data: any) => login(data),
    onSuccess: async (data: any) => {
      setAccessToken(data.jwt);
      await SecureStore.setItemAsync('accessToken', data.jwt);
      const user = await queryClient.fetchQuery(createFetchMeQuery(data.jwt));

      if (user) {
        setUser(user);
        await registerUserPushToken.mutate(
          {
            documentId: expoPushToken.documentId,
            deviceId: expoPushToken.deviceId,
            user: user.id,
          },
          {
            onSuccess(data) {
              setExpoPushToken(data);
            },
          },
        );
      }
    },
    onError: (error: Error) => {
      console.error(error);
    },
  });
};
