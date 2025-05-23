import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createExpoPushToken } from '@/api';

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
