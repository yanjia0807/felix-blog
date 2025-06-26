import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useRef } from 'react';
import useToast from './use-toast';

const appName = Constants?.expoConfig?.extra?.name || '';

export const useMediaLibPermissions = () => {
  const [libraryPermissions, requestLibraryPermission] = ImagePicker.useMediaLibraryPermissions();
  const toast = useToast();
  const onToast = useRef((type, message): any => {
    toast[type](message);
  });

  const requestMediaLibPermissions = useCallback(async () => {
    if (libraryPermissions.granted) {
      return libraryPermissions;
    }

    const result = await requestLibraryPermission();
    if (result.granted) {
      return libraryPermissions;
    } else {
      if (!result.canAskAgain) {
        onToast.current('info', {
          description: `请在 [系统设置] 里允许 ${appName} 访问您的照片。`,
        });
      }
      return libraryPermissions;
    }
  }, [libraryPermissions, requestLibraryPermission]);

  return {
    libraryPermissions,
    requestMediaLibPermissions,
  };
};
