import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import _ from 'lodash';
import { useCreateExpoPushTokenMutation } from '../api/use-create-expo-push-token';
import { createFetchExpoPushTokenQuery } from '../api/use-fetch-expo-push-token';

export const useRegisterExpoPushToken = () => {
  const [expoPushToken, setExpoPushToken] = useState<any>();
  const queryClient = useQueryClient();
  const { mutate } = useCreateExpoPushTokenMutation();

  useEffect(() => {
    const register = async () => {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (_.isNil(projectId)) {
        console.error('project id not found');
        return;
      }

      let deviceId = await SecureStore.getItemAsync('deviceId');
      if (_.isNil(deviceId)) {
        deviceId = `${Device.modelName}-${Date.now()}`;
        await SecureStore.setItemAsync('deviceId', deviceId);
      }

      const pushToken: any = await queryClient.fetchQuery(createFetchExpoPushTokenQuery(deviceId));
      if (pushToken) {
        setExpoPushToken(pushToken);
        return;
      } else {
        const res = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        const token = res.data;

        if (!token) {
          console.error('not get push noticefication token');
          return;
        }

        await mutate(
          {
            deviceId,
            token,
          },
          {
            onSuccess(data) {
              setExpoPushToken(data);
            },
          },
        );
      }
    };

    register();
  }, [mutate, queryClient]);

  return {
    expoPushToken,
    setExpoPushToken,
  };
};
