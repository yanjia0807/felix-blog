import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createComment } from '@/api';

export const useCreateComment = ({ postDocumentId }: any) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comment: any) => createComment(comment),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['comments', 'list', postDocumentId],
      });

      await queryClient.invalidateQueries({
        queryKey: ['comments', 'count', postDocumentId],
      });

      await queryClient.invalidateQueries({
        queryKey: ['posts', 'list'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['posts', 'detail', postDocumentId],
      });
    },
    onError: (error: any) => {
      console.error(error);
    },
  });
};
