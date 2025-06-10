import { login } from '@/api';
import { usePushNotification } from '@/features/push-notification/components/push-notification-provider';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';

export const useLogin = () => {
  const { doLogin } = useAuth();
  const { registerPushNotification } = usePushNotification();

  return useMutation({
    mutationFn: (data: any) => login(data),
    onSuccess: async (data: any) => {
      doLogin(data.jwt);
      registerPushNotification();
    },
    onError: (error: Error) => {
      console.error(error);
    },
  });
};
