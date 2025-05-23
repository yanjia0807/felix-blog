import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateExpoPushToken } from '@/api';

export const useUpdateExpoPushToken = () => {
  const queryClient = useQueryClient();

  const registerUserPushToken = useMutation({
    mutationFn: ({ documentId, deviceId, user }: any) =>
      updateExpoPushToken({ documentId, data: { deviceId, user } }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['pushNotificationTokens', 'detail', variables.deviceId],
      });
    },
    onError(error) {
      console.error(error);
    },
  });

  const unRegisterUserPushToken = useMutation({
    mutationFn: ({ documentId, deviceId }: any) =>
      updateExpoPushToken({ documentId, data: { deviceId, use: null } }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['pushNotificationTokens', 'detail', variables.deviceId],
      });
    },
    onError(error) {
      console.error(error);
    },
  });

  return {
    registerUserPushToken,
    unRegisterUserPushToken,
  };
};
