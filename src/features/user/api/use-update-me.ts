import { updateMe } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateMe = (userDocumentId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ formData }: any) => {
      return updateMe(formData);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({
        queryKey: ['users', 'detail', 'me'],
      });
      queryClient.invalidateQueries({
        queryKey: ['users', 'detail', { documentId: userDocumentId }],
      });
    },
    onError(error, variables, context) {
      console.error(error);
    },
  });
};
