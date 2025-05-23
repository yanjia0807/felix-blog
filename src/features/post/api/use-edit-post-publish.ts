import { useMutation, useQueryClient } from '@tanstack/react-query';
import { editPublish } from '@/api';

export const useEditPostPublish = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, isPublished }: any) => editPublish({ documentId, isPublished }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'list'] });
      queryClient.invalidateQueries({
        queryKey: ['posts', 'detail', variables.documentId],
      });
    },
    onError(error, variables, context) {
      console.error(error);
    },
  });
};
