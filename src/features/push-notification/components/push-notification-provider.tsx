import { createFetchMeQuery } from '@/features/user/api/use-fetch-me';
import { getDeviceId, getProjectId } from '@/utils/common';
import { useQueryClient } from '@tanstack/react-query';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useCreateExpoPushToken } from '../api/use-create-expo-push-token';
import {
  createFetchExpoPushTokenQuery,
  useFetchExpoPushToken,
} from '../api/use-fetch-expo-push-token';
import { useUpdateExpoPushToken } from '../api/use-update-expo-push-token';
import { useDeviceId } from '../hooks/use-deviceId';

const PushNotificationContext = createContext<any>(undefined);

export const usePushNotification = () => {
  const context = useContext(PushNotificationContext);
  if (!context) {
    throw new Error('usePushNotification must be used within a PushNotificationProvider');
  }
  return context;
};

export const PushNotificationProvider = ({ children }: any) => {
  useEffect(() => console.log('@render PushNotificationProvider'));

  const { deviceId } = useDeviceId();
  const queryClient = useQueryClient();
  const router = useRouter();
  const expoPushTokenQuery = useFetchExpoPushToken({ deviceId });
  const { registerUserPushToken, unRegisterUserPushToken } = useUpdateExpoPushToken();
  const createExpoPushTokenMutation = useCreateExpoPushToken();

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  const registerPushNotification = React.useCallback(async () => {
    const pushTokenQuery = await queryClient.fetchQuery(
      createFetchExpoPushTokenQuery({ deviceId }),
    );

    const accessToken = await SecureStore.getItemAsync('accessToken');
    const user = await queryClient.fetchQuery(createFetchMeQuery(accessToken));

    if (pushTokenQuery) {
      await registerUserPushToken.mutate({
        documentId: pushTokenQuery.documentId,
        deviceId: pushTokenQuery.deviceId,
        user: user.id,
      });
    }
  }, [queryClient, deviceId, registerUserPushToken]);

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

  useEffect(() => {
    const register = async () => {
      if (!Device.isDevice) {
        console.log('must use a physical device for push notifications.');
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      const finalStatus =
        existingStatus === 'granted'
          ? existingStatus
          : (await Notifications.requestPermissionsAsync()).status;

      if (finalStatus !== 'granted') {
        console.log('failed to get push notification token.');
        return;
      }

      const deviceId = await getDeviceId();
      const projectId = getProjectId();
      const pushToken: any = await queryClient.fetchQuery(createFetchExpoPushTokenQuery(deviceId));

      let token = null;
      if (!pushToken) {
        try {
          const res = await Notifications.getExpoPushTokenAsync({
            projectId,
          });
          token = res.data;
        } catch (error) {
          console.error(error);
          return;
        }

        const accessToken = await SecureStore.getItemAsync('accessToken');
        const user = await queryClient.fetchQuery(createFetchMeQuery(accessToken));

        await createExpoPushTokenMutation.mutate({
          deviceId,
          token,
          user: user?.id,
        });
      }

      const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
        console.log('receive notification', JSON.stringify(notification));
      });

      const responseListener = Notifications.addNotificationResponseReceivedListener(
        async (response) => {
          const data = response.notification.request.content.data;
          if (data.type === 'chat') {
            const accessToken = await SecureStore.getItemAsync('accessToken');
            const user = await queryClient.fetchQuery(createFetchMeQuery(accessToken));
            if (user) {
              router.navigate(`/chats/${data.chatId}`);
            }
          }
        },
      );

      return () => {
        notificationListener.remove();
        responseListener.remove();
      };
    };

    register();
  }, []);

  return (
    <PushNotificationContext.Provider value={value}>{children}</PushNotificationContext.Provider>
  );
};
