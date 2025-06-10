import { cancelFriend } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCancelFriend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId }: any) => {
      const params = { friend: documentId };
      return cancelFriend(params);
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['users', 'detail', 'me'],
      });

      queryClient.invalidateQueries({
        queryKey: ['users', 'detail', { documentId: variables.documentId }],
      });

      queryClient.invalidateQueries({
        queryKey: ['friends', 'list'],
      });

      queryClient.invalidateQueries({
        queryKey: ['followings', 'list'],
      });

      queryClient.invalidateQueries({
        queryKey: ['followers', 'list'],
      });
    },
    onError(error) {
      console.error(error);
    },
  });
};
