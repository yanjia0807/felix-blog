import { createComment } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comment: any) => createComment(comment),
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['comments', 'list', { postDocumentId: variables.post }],
      });

      await queryClient.invalidateQueries({
        queryKey: [
          'comments',
          'list',
          { postDocumentId: variables.post, commentDocumentId: variables.topComment },
        ],
      });

      await queryClient.invalidateQueries({
        queryKey: ['comments', 'count', { postDocumentId: variables.post }],
      });

      await queryClient.invalidateQueries({
        queryKey: ['posts', 'list'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['posts', 'detail', { documentId: variables.post }],
      });
    },
    onError: (error: any) => {
      console.error(error);
    },
  });
};
