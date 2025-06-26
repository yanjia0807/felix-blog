import Constants from 'expo-constants';
import { useCallback, useRef } from 'react';
import { Linking } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import useToast from './use-toast';

const appName = Constants?.expoConfig?.extra?.name || '';

export const useCamPermissions = () => {
  const toast = useToast();
  const onToast = useRef((type, message): any => {
    toast[type](message);
  });

  const requestCamPermissions = useCallback(async () => {
    let camPermission = Camera.getCameraPermissionStatus();

    if (camPermission !== 'granted') {
      camPermission = await Camera.requestCameraPermission();

      if (camPermission !== 'granted') {
        onToast.current('confirm', {
          description: `请在 [系统设置] 里允许 ${appName} 访问您的相机。`,
          onConfirm: async () => {
            Linking.openURL('app-settings:');
          },
        });
      }
    }

    return camPermission;
  }, []);

  return {
    requestCamPermissions,
  };
};
