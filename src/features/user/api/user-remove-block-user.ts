import { removeBlockUser } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useRemoveBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId }: any) => {
      const params = { user: documentId };
      return removeBlockUser(params);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['users', 'detail', 'me'],
      });

      queryClient.invalidateQueries({
        queryKey: ['users', 'detail', { documentId: variables.documentId }],
      });

      queryClient.invalidateQueries({
        queryKey: ['posts', 'list'],
      });

      queryClient.invalidateQueries({
        queryKey: ['banners', 'list'],
      });

      queryClient.invalidateQueries({
        queryKey: ['comments', 'list'],
      });

      queryClient.invalidateQueries({
        queryKey: ['comments', 'list'],
      });
    },
    onError(error, variables, context) {
      console.error(error);
    },
  });
};
