import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { getDeviceId, getProjectId } from '@/utils/common';
import { useCreateExpoPushToken } from '../api/use-create-expo-push-token';
import { createFetchExpoPushTokenQuery } from '../api/use-fetch-expo-push-token';

export const useRegisterExpoPushToken = () => {
  const queryClient = useQueryClient();
  const { mutate } = useCreateExpoPushToken();

  useEffect(() => {
    const register = async () => {
      const projectId = getProjectId();
      const deviceId = await getDeviceId();
      const pushToken: any = await queryClient.fetchQuery(createFetchExpoPushTokenQuery(deviceId));

      if (!pushToken) {
        const res = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        const token = res.data;

        if (!token) {
          console.error('not get push noticefication token');
          return;
        }

        await mutate({
          deviceId,
          token,
        });
      } else {
      }
    };

    register();
  }, [mutate, queryClient]);
};
