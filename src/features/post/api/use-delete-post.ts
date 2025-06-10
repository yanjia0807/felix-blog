import { deletePost } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId }: any) => deletePost({ documentId }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'list'] });
      queryClient.invalidateQueries({
        queryKey: ['posts', 'detail', { documentId: variables.documentId }],
      });
    },
    onError(error, variables, context) {
      console.error(error);
    },
  });
};
