import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateExpoPushToken } from '@/api';

export const useUpdateExpoPushTokenMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, data }: any) => updateExpoPushToken({ documentId, data }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['pushNotificationTokens', 'detail', , variables.data.deviceId],
      });
    },
    onError(error, variables, context) {
      console.error(error);
    },
  });
};
