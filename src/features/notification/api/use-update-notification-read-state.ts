import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateNotificationReadState } from '@/api';

export const useUpdateNotificationReadState = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNotificationReadState,
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
