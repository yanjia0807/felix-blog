import { updateNotificationsReadState } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateNotificationsReadState = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNotificationsReadState,
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
