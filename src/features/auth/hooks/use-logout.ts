import { usePushNotification } from '@/features/push-notification/components/push-notification-provider';
import { useSocket } from '@/features/socket/components/socket-provider';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../components/auth-provider';

export const useLogout = () => {
  const { clearAccessToken } = useAuth();
  const { unRegisterPushNotification } = usePushNotification();
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const logout = async () => {
    await clearAccessToken();
    await queryClient.invalidateQueries({ queryKey: ['users', 'detail', 'me'] });
    queryClient.clear();
    socket.disconnect();
    unRegisterPushNotification();
  };

  return { logout };
};
