import { createFetchMeQuery } from '@/features/user/api/use-fetch-me';
import { useNotificationPermissions } from '@/hooks/use-notification-permissions';
import { getDeviceId, getProjectId } from '@/utils/common';
import { useQueryClient } from '@tanstack/react-query';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useCreateExpoPushToken } from '../api/use-create-expo-push-token';
import { createFetchExpoPushTokenQuery } from '../api/use-fetch-expo-push-token';
import { useUpdateExpoPushToken } from '../api/use-update-expo-push-token';

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

  const queryClient = useQueryClient();
  const router = useRouter();
  const updateExpoPushToken = useUpdateExpoPushToken();
  const { mutate: createExpoPushToken } = useCreateExpoPushToken();
  const { requestNotificationPermissions } = useNotificationPermissions();

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
    const deviceId = await getDeviceId();

    const pushTokenQuery = await queryClient.fetchQuery(
      createFetchExpoPushTokenQuery({ deviceId }),
    );
    const user = await queryClient.fetchQuery(createFetchMeQuery());

    if (pushTokenQuery) {
      await updateExpoPushToken.mutate({
        documentId: pushTokenQuery.documentId,
        deviceId: pushTokenQuery.deviceId,
        user: user?.id,
      });
    }
  }, [queryClient, updateExpoPushToken]);

  const unRegisterPushNotification = React.useCallback(async () => {
    const deviceId = await getDeviceId();
    const pushTokenQuery = await queryClient.fetchQuery(
      createFetchExpoPushTokenQuery({ deviceId }),
    );

    updateExpoPushToken.mutate({
      documentId: pushTokenQuery.documentId,
      user: null,
    });
  }, [queryClient, updateExpoPushToken]);

  const value = useMemo(
    () => ({
      registerPushNotification,
      unRegisterPushNotification,
    }),
    [registerPushNotification, unRegisterPushNotification],
  );

  useEffect(() => {
    const register = async () => {
      if (!Device.isDevice) {
        console.log('must use a physical device for push notifications.');
        return;
      }

      const status = await requestNotificationPermissions();
      if (status !== 'granted') {
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

        const user = await queryClient.fetchQuery(createFetchMeQuery());

        await createExpoPushToken({
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
            const user = await queryClient.fetchQuery(createFetchMeQuery());
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
  }, [createExpoPushToken, queryClient, requestNotificationPermissions, router]);

  return (
    <PushNotificationContext.Provider value={value}>{children}</PushNotificationContext.Provider>
  );
};
