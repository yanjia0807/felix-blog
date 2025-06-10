import { createExpoPushToken } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateExpoPushToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) =>
      createExpoPushToken({
        data,
      }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ['pushNotificationTokens', 'detail', variables.deviceId],
      });
    },
    onError(error) {
      console.error(error);
    },
  });
};
