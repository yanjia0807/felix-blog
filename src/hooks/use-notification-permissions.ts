import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useCallback, useRef } from 'react';
import useToast from './use-toast';

const appName = Constants?.expoConfig?.extra?.name || '';

export const useNotificationPermissions = () => {
  const toast = useToast();
  const onToast = useRef((type, message): any => toast[type](message));

  const requestNotificationPermissions = useCallback(async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    const finalStatus =
      existingStatus === 'granted'
        ? existingStatus
        : (await Notifications.requestPermissionsAsync()).status;

    if (finalStatus !== 'granted') {
      onToast.current('info', {
        description: `请在 [系统设置] 里允许 ${appName} 发送通知。`,
      });
    }

    return Promise.resolve(finalStatus);
  }, []);

  return {
    requestNotificationPermissions,
  };
};
