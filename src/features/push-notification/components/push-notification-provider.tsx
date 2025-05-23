import React, { createContext, useContext, useMemo } from 'react';
import {
  createFetchExpoPushTokenQuery,
  useFetchExpoPushToken,
} from '../api/use-fetch-expo-push-token';
import { useUpdateExpoPushToken } from '../api/use-update-expo-push-token';
import { useDeviceId } from '../hooks/use-deviceId';
import { useRegisterExpoPushToken } from '../hooks/use-register-expo-push-token';
import { useQueryClient } from '@tanstack/react-query';

const PushNotificationContext = createContext<any>(undefined);

export const usePushNotification = () => {
  const context = useContext(PushNotificationContext);
  if (!context) {
    throw new Error('usePushNotification must be used within a PushNotificationProvider');
  }
  return context;
};

export const PushNotificationProvider = ({ children }: any) => {
  const { deviceId } = useDeviceId();
  const queryClient = useQueryClient();
  const expoPushTokenQuery = useFetchExpoPushToken({ deviceId });
  const { registerUserPushToken, unRegisterUserPushToken } = useUpdateExpoPushToken();

  useRegisterExpoPushToken();

  const registerPushNotification = React.useCallback(
    async ({ user }) => {
      debugger;
      const pushTokenQuery = await queryClient.fetchQuery(
        createFetchExpoPushTokenQuery({ deviceId }),
      );
      if (pushTokenQuery && user) {
        await registerUserPushToken.mutate({
          documentId: pushTokenQuery.documentId,
          deviceId: pushTokenQuery.deviceId,
          user: user.id,
        });
      }
    },
    [queryClient, deviceId, registerUserPushToken],
  );

  const unRegisterPushNotification = React.useCallback(async () => {
    const pushTokenQuery = await queryClient.fetchQuery(
      createFetchExpoPushTokenQuery({ deviceId }),
    );
    unRegisterUserPushToken.mutate({
      documentId: pushTokenQuery.documentId,
      deviceId: pushTokenQuery.deviceId,
    });
  }, [queryClient, deviceId, unRegisterUserPushToken]);

  const value = useMemo(
    () => ({
      expoPushToken: expoPushTokenQuery.data,
      registerPushNotification,
      unRegisterPushNotification,
    }),
    [expoPushTokenQuery.data, registerPushNotification, unRegisterPushNotification],
  );

  return (
    <PushNotificationContext.Provider value={value}>{children}</PushNotificationContext.Provider>
  );
};
