import { updateFollowings } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useEditFollow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId }: any) => {
      const params = { following: documentId };
      return updateFollowings(params);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['users', 'detail', 'me'],
      });
      queryClient.invalidateQueries({
        queryKey: ['users', 'detail', { documentId: variables.documentId }],
      });
      queryClient.invalidateQueries({
        queryKey: ['followings', 'list'],
      });
      queryClient.invalidateQueries({
        queryKey: ['followers', 'list'],
      });
    },
    onError(error, variables, context) {
      console.error(error);
    },
  });
};
