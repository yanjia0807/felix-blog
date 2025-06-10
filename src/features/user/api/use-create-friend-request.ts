import { createFriendRequest } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateFriendRequestMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId }: any) => {
      const params = { receiver: documentId };
      return createFriendRequest(params);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['friendRequest', 'list', { receiver: variables.documentId }],
      });
    },
    onError(error, variables, context) {
      console.error(error);
    },
  });
};
