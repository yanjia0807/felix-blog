import { updateChatStatus } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateChatStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => updateChatStatus(data),
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ['chats', 'list'],
      });
      queryClient.invalidateQueries({
        queryKey: ['chats', 'unread-count'],
      });
    },
    onError(error, variables, context) {
      console.error(error);
    },
  });
};
