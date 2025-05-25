import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteComment } from '@/api';

export const useDeleteComment = ({ postDocumentId }: any) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId }: any) => deleteComment(documentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['comments', 'list', postDocumentId],
      });

      await queryClient.invalidateQueries({
        queryKey: ['comments', 'count', postDocumentId],
      });

      await queryClient.invalidateQueries({
        queryKey: ['posts', 'detail', { documentId: postDocumentId }],
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
