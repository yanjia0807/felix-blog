import { updateExpoPushToken } from '@/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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
      updateExpoPushToken({ documentId, data: { deviceId, user: null } }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['pushNotificationTokens', 'detail', variables.deviceId],
      });
    },
    onError(error) {
      console.error(error);
    },
  });

  const updatePushTokenEnabled = useMutation({
    mutationFn: ({ documentId, deviceId, enabled }: any) =>
      updateExpoPushToken({ documentId, data: { deviceId, enabled } }),
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
    updatePushTokenEnabled,
  };
};
