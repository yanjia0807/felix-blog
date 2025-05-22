import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/features/socket/components/socket-provider';

export const useListenMessage = ({ documentId }) => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  useEffect(() => {
    socket?.on('message', () => {
      queryClient.invalidateQueries({ queryKey: ['chats', 'detail', documentId] });
      queryClient.invalidateQueries({ queryKey: ['chats', 'list'] });
      queryClient.invalidateQueries({
        queryKey: ['messsages', 'list', { chatDocumentId: documentId }],
      });
    });

    return () => {
      socket?.off('message');
    };
  }, [documentId, queryClient, socket]);
};
