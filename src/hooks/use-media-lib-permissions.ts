import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useRef } from 'react';
import { Linking } from 'react-native';
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
      return true;
    }

    const result = await requestLibraryPermission();
    if (!result.canAskAgain) {
      onToast.current('confirm', {
        description: `请在 [系统设置] 里允许 ${appName} 访问您的照片。`,
        onConfirm: async () => {
          Linking.openURL('app-settings:');
        },
      });
    }
    return result.granted;
  }, [libraryPermissions, requestLibraryPermission]);

  return {
    requestMediaLibPermissions,
  };
};
