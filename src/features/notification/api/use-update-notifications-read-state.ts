import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateNotificationsReadState } from '@/api';

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
