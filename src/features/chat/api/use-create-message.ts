import { createMessage } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateMessage = ({ documentId }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => createMessage(data),
    onSuccess: async (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ['chats', 'list'],
      });

      queryClient.invalidateQueries({
        queryKey: ['chats', 'detail', { documentId }],
      });

      queryClient.invalidateQueries({
        queryKey: ['messsages', 'list', { chatDocumentId: documentId }],
      });
    },
  });
};
