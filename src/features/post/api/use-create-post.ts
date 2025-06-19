import { createPost } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PostSchema } from '../components/post-form';

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PostSchema) => createPost(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'list'] });
    },
    onError(error, variables, context) {
      console.error(error);
    },
  });
};
