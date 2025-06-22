import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useState } from 'react';
import useToast from './use-toast';

const appName = Constants?.expoConfig?.extra?.name || '';

export const useNotificationPermissions = () => {
  const [notificationPermissions, setNoficationPermissions] =
    useState<Notifications.PermissionStatus>();
  const toast = useToast();

  const requestNotificationPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    const finalStatus =
      existingStatus === 'granted'
        ? existingStatus
        : (await Notifications.requestPermissionsAsync()).status;
    setNoficationPermissions(finalStatus);

    if (finalStatus !== 'granted') {
      toast.info({
        description: `请在 [系统设置] 里允许 ${appName} 发送通知。`,
      });
    }

    return finalStatus;
  };

  return {
    notificationPermissions,
    requestNotificationPermissions,
  };
};
