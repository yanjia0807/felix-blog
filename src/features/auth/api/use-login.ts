import { login } from '@/api';
import { usePushNotification } from '@/features/push-notification/components/push-notification-provider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';

export const useLogin = () => {
  const { updateAccessToken } = useAuth();
  const { registerPushNotification } = usePushNotification();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => login(data),
    onSuccess: async (data: any) => {
      await updateAccessToken(data.jwt);
      await queryClient.invalidateQueries({ queryKey: ['users', 'detail', 'me'] });
      registerPushNotification();
    },
    onError: (error: Error) => {
      console.error(error);
    },
  });
};
