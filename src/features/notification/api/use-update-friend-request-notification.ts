import { updateFriendRequestNotification } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateFriendRequestNotificationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, friendRequest, state }: any) => {
      const params = { documentId, friendRequest, state };
      return updateFriendRequestNotification(params);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['users', 'detail', 'me'],
      });

      queryClient.invalidateQueries({
        queryKey: ['users', 'detail', { documentId: variables.sender }],
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

      queryClient.invalidateQueries({
        queryKey: ['notifications', 'count'],
      });

      queryClient.invalidateQueries({
        queryKey: ['notifications', 'list'],
      });
    },
    onError(error) {
      console.error(error);
    },
  });
};
