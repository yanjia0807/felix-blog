import Constants from 'expo-constants';
import { useCallback, useRef, useState } from 'react';
import { Camera, CameraPermissionStatus } from 'react-native-vision-camera';
import useToast from './use-toast';

const appName = Constants?.expoConfig?.extra?.name || '';

export const useMediaMicPermissions = () => {
  const toast = useToast();
  const onToast = useRef((type, message): any => {
    toast[type](message);
  });

  const [meidaMicPermission, setMeidaMicPermission] = useState<CameraPermissionStatus>();

  const requestMediaMicPermissions = useCallback(async () => {
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
      onToast.current('info', {
        description: `请在 [系统设置] 里允许 ${appName} 访问您的麦克风。`,
      });
      return permission;
    }
  }, []);

  return {
    meidaMicPermission,
    requestMediaMicPermissions,
  };
};
