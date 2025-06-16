import { updateExpoPushToken } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateExpoPushToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) =>
      updateExpoPushToken({
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
