import { usePushNotification } from '@/features/push-notification/components/push-notification-provider';
import { useAuth } from '../components/auth-provider';

export const useLogout = () => {
  const { doLogout } = useAuth();
  const { unRegisterPushNotification } = usePushNotification();

  const logout = () => {
    doLogout();
    unRegisterPushNotification();
  };

  return { logout };
};
