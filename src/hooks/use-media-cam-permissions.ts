import Constants from 'expo-constants';
import { useCallback, useRef, useState } from 'react';
import { Camera, CameraPermissionStatus } from 'react-native-vision-camera';
import useToast from './use-toast';

const appName = Constants?.expoConfig?.extra?.name || '';

export const useMediaCamPermissions = () => {
  const toast = useToast();
  const onToast = useRef((type, message): any => {
    toast[type](message);
  });

  const [meidaCamPermission, setMeidaCamPermission] = useState<CameraPermissionStatus>();

  const requestMediaCamPermissions = useCallback(async () => {
    let permission = Camera.getCameraPermissionStatus();
    setMeidaCamPermission(permission);
    if (permission === 'granted') {
      return permission;
    }

    permission = await Camera.requestCameraPermission();
    setMeidaCamPermission(permission);
    if (permission === 'granted') {
      return permission;
    } else {
      onToast.current('info', {
        description: `请在 [系统设置] 里允许 ${appName} 访问您的相机。`,
      });

      return permission;
    }
  }, []);

  return {
    meidaCamPermission,
    requestMediaCamPermissions,
  };
};
