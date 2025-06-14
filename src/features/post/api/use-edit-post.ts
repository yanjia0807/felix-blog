import { editPost } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useEditPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => {
      return editPost(data);
    },
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
