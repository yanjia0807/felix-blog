import { updateNotificationReadState } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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
