import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { createFetchMeQuery } from '@/features/user/api/use-fetch-me';
import { getDeviceId, getProjectId } from '@/utils/common';
import { useCreateExpoPushToken } from '../api/use-create-expo-push-token';
import { createFetchExpoPushTokenQuery } from '../api/use-fetch-expo-push-token';

const registerToken = async () => {
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

  const projectId = getProjectId();
  const token = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  return token;
};

export const useRegisterExpoPushNotification = () => {
  const queryClient = useQueryClient();
  const { mutate } = useCreateExpoPushToken();
  const router = useRouter();

  useEffect(() => {
    const register = async () => {
      const deviceId = await getDeviceId();
      const pushToken: any = await queryClient.fetchQuery(createFetchExpoPushTokenQuery(deviceId));

      if (!pushToken) {
        const token = await registerToken();
        await mutate({
          deviceId,
          token,
        });
      }

      const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
        console.log('@@@@', JSON.stringify(notification));
      });

      const responseListener = Notifications.addNotificationResponseReceivedListener(
        async (response) => {
          const data = response.notification.request.content.data;
          if (data.type === 'chat') {
            const accessToken = await SecureStore.getItemAsync('accessToken');
            const user = await queryClient.fetchQuery(createFetchMeQuery({ accessToken }));
            console.log('@@@@@@@@', user);
            if (user) {
              router.navigate(`/chats/${data.chatId}`);
            }
          }
        },
      );

      return () => {
        Notifications.removeNotificationSubscription(notificationListener);
        Notifications.removeNotificationSubscription(responseListener);
      };
    };

    register();
  }, [mutate, queryClient, router]);
};
