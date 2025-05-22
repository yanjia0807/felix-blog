import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createChat } from '@/api';

export const useCreateChat = ({ userDocumentIds }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      createChat({
        userDocumentIds,
      }),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: ['chats', 'list'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['chats', 'detail', { userDocumentIds }],
      });
    },
  });
};
