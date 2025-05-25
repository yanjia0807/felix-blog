import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteChat } from '@/api';

export const useDeleteChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId }: any) =>
      deleteChat({
        documentId,
      }),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: ['chats', 'list'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['chats', 'detail', { documentId: variables.documentId }],
      });
    },
  });
};
