import Constants from 'expo-constants';
import { useState } from 'react';
import { check, PERMISSIONS, PermissionStatus, request, RESULTS } from 'react-native-permissions';
import useToast from './use-toast';

const appName = Constants?.expoConfig?.extra?.name || '';

export const useLocationPermissions = () => {
  const toast = useToast();
  const [locationPermission, setLocationPermission] = useState<PermissionStatus>();

  const requesLocationPermissions = async () => {
    let permission = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    setLocationPermission(permission);

    if (permission === RESULTS.BLOCKED) {
      toast.info({
        description: `请在系统设置中允许 ${appName} 访问您的位置`,
      });
      return permission;
    }

    if (permission !== RESULTS.GRANTED) {
      permission = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      setLocationPermission(permission);

      if (permission !== RESULTS.GRANTED) {
        toast.info({
          description: `请在系统设置中允许 ${appName} 访问您的位置`,
        });
        return permission;
      }
    }

    return permission;
  };

  return {
    locationPermission,
    requesLocationPermissions,
  };
};
