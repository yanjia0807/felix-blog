import { useAuth } from '@/features/auth/components/auth-provider';
import { useQueryClient } from '@tanstack/react-query';
import * as Notification from 'expo-notifications';
import React, { createContext, useContext, useMemo } from 'react';
import {
  createFetchExpoPushTokenQuery,
  useFetchExpoPushToken,
} from '../api/use-fetch-expo-push-token';
import { useUpdateExpoPushToken } from '../api/use-update-expo-push-token';
import { useDeviceId } from '../hooks/use-deviceId';
import { useRegisterExpoPushNotification } from '../hooks/use-reigster-expo-push-notification';

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
  const { user } = useAuth();
  const { registerUserPushToken, unRegisterUserPushToken } = useUpdateExpoPushToken();

  Notification.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  useRegisterExpoPushNotification();

  const registerPushNotification = React.useCallback(async () => {
    const pushTokenQuery = await queryClient.fetchQuery(
      createFetchExpoPushTokenQuery({ deviceId }),
    );
    if (pushTokenQuery) {
      await registerUserPushToken.mutate({
        documentId: pushTokenQuery.documentId,
        deviceId: pushTokenQuery.deviceId,
        user: user.id,
      });
    }
  }, [queryClient, deviceId, user, registerUserPushToken]);

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
