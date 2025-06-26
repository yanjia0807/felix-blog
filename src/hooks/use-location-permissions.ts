import Constants from 'expo-constants';
import { useCallback, useRef, useState } from 'react';
import { Linking } from 'react-native';
import { check, PERMISSIONS, PermissionStatus, request, RESULTS } from 'react-native-permissions';
import useToast from './use-toast';

const appName = Constants?.expoConfig?.extra?.name || '';

export const useLocationPermissions = () => {
  const [locationPermission, setLocationPermission] = useState<PermissionStatus>();

  const toast = useToast();
  const onToast = useRef((type, message): any => {
    toast[type](message);
  });

  const requesLocationPermissions = useCallback(async () => {
    let permission = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

    if (permission === RESULTS.BLOCKED) {
      onToast.current('confirm', {
        description: `请在系统设置中允许 ${appName} 访问您的位置`,
        onConfirm: async () => {
          Linking.openURL('app-settings:');
        },
      });
      setLocationPermission(permission);
      return permission;
    }

    if (permission !== RESULTS.GRANTED) {
      permission = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

      if (permission !== RESULTS.GRANTED) {
        onToast.current('confirm', {
          description: `请在系统设置中允许 ${appName} 访问您的位置`,
          onConfirm: async () => {
            Linking.openURL('app-settings:');
          },
        });
      }
    }

    setLocationPermission(permission);
    return permission;
  }, []);

  return {
    locationPermission,
    requesLocationPermissions,
  };
};
