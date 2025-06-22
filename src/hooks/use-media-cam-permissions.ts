import Constants from 'expo-constants';
import { useState } from 'react';
import { Camera, CameraPermissionStatus } from 'react-native-vision-camera';
import useToast from './use-toast';

const appName = Constants?.expoConfig?.extra?.name || '';

export const useMediaCamPermissions = () => {
  const toast = useToast();
  const [meidaCamPermission, setMeidaCamPermission] = useState<CameraPermissionStatus>();

  const requestMediaCamPermissions = async () => {
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
      toast.info({
        description: `请在 [系统设置] 里允许 ${appName} 访问您的相机。`,
      });
      return permission;
    }
  };

  return {
    meidaCamPermission,
    requestMediaCamPermissions,
  };
};
