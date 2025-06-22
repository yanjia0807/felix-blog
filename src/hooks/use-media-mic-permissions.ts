import Constants from 'expo-constants';
import { useState } from 'react';
import { Camera, CameraPermissionStatus } from 'react-native-vision-camera';
import useToast from './use-toast';

const appName = Constants?.expoConfig?.extra?.name || '';

export const useMediaMicPermissions = () => {
  const toast = useToast();
  const [meidaMicPermission, setMeidaMicPermission] = useState<CameraPermissionStatus>();

  const requestMediaMicPermissions = async () => {
    let permission = Camera.getMicrophonePermissionStatus();
    setMeidaMicPermission(permission);

    if (permission === 'granted') {
      return permission;
    }

    permission = await Camera.requestMicrophonePermission();
    setMeidaMicPermission(permission);
    if (permission === 'granted') {
      return permission;
    } else {
      toast.info({
        description: `请在 [系统设置] 里允许 ${appName} 访问您的麦克风。`,
      });
      return permission;
    }
  };

  return {
    meidaMicPermission,
    requestMediaMicPermissions,
  };
};
