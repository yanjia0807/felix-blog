import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateChatStatus } from '@/api';

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
