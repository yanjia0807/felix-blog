import Constants from 'expo-constants';
import { useCallback, useRef } from 'react';
import { Linking } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import useToast from './use-toast';

const appName = Constants?.expoConfig?.extra?.name || '';

export const useMicPermissions = () => {
  const toast = useToast();
  const onToast = useRef((type, message): any => {
    toast[type](message);
  });

  const requestMicPermissions = useCallback(async () => {
    let micPermission = Camera.getMicrophonePermissionStatus();

    if (micPermission !== 'granted') {
      micPermission = await Camera.requestMicrophonePermission();

      if (micPermission !== 'granted') {
        onToast.current('confirm', {
          description: `请在 [系统设置] 里允许 ${appName} 访问您的麦克风。`,
          onConfirm: async () => {
            Linking.openURL('app-settings:');
          },
        });
      }
    }

    return micPermission;
  }, []);

  return {
    requestMicPermissions,
  };
};
