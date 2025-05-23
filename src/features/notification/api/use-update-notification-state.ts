import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateNotificationState } from '@/api';

export const useUpdateNotificationState = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNotificationState,
    onSuccess: () => {
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
