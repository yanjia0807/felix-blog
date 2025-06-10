import { deleteComment } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postDocumentId, commentDocumentId }: any) => deleteComment(commentDocumentId),
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['comments', 'list', { postDocumentId: variables.postDocumentId }],
      });

      await queryClient.invalidateQueries({
        queryKey: [
          'comments',
          'list',
          {
            postDocumentId: variables.postDocumentId,
            commentDocumentId: variables.commentDocumentId,
          },
        ],
      });

      await queryClient.invalidateQueries({
        queryKey: ['comments', 'count', { postDocumentId: variables.postDocumentId }],
      });

      await queryClient.invalidateQueries({
        queryKey: ['posts', 'detail', { documentId: variables.postDocumentId }],
      });

      await queryClient.invalidateQueries({
        queryKey: ['posts', 'list'],
      });
    },
    onError: (error: any) => {
      console.error(error);
    },
  });
};
