import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/features/socket/components/socket-provider';

export const useListenNotification = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  return useEffect(() => {
    socket?.on('notification', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'count'] });
    });

    return () => {
      socket?.off('notification');
    };
  }, [queryClient, socket]);
};
