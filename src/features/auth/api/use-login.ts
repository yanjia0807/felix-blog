import { login } from '@/api';
import { usePushNotification } from '@/features/push-notification/components/push-notification-provider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

export const useLogin = () => {
  const { registerPushNotification } = usePushNotification();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => login(data),
    onSuccess: async (data: any) => {
      SecureStore.setItemAsync('accessToken', data.jwt);
      queryClient.invalidateQueries({ queryKey: ['users', 'detail', 'me'] });
      registerPushNotification();
    },
    onError: (error: Error) => {
      console.error(error);
    },
  });
};
