import { editPost } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PostSchema } from '../components/post-form';

export const useEditPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PostSchema) => {
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
