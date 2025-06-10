import { useAuth } from '@/features/auth/components/auth-provider';
import { getDeviceId, getProjectId } from '@/utils/common';
import { useQueryClient } from '@tanstack/react-query';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
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
  try {
    const res = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

export const useRegisterExpoPushNotification = () => {
  const queryClient = useQueryClient();
  const { mutate } = useCreateExpoPushToken();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const register = async () => {
      const deviceId = await getDeviceId();
      const pushToken: any = await queryClient.fetchQuery(createFetchExpoPushTokenQuery(deviceId));

      if (!pushToken) {
        const token = await registerToken();
        if (!token) return;

        await mutate({
          deviceId,
          token,
        });
      }

      const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
        console.log('receive notification', JSON.stringify(notification));
      });

      const responseListener = Notifications.addNotificationResponseReceivedListener(
        async (response) => {
          const data = response.notification.request.content.data;
          if (data.type === 'chat') {
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
  }, [mutate, queryClient, router, user]);
};
