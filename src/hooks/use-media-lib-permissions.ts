import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import useToast from './use-toast';

const appName = Constants?.expoConfig?.extra?.name || '';

export const useMediaLibPermissions = () => {
  const [libraryPermissions, requestLibraryPermission] = ImagePicker.useMediaLibraryPermissions();
  const toast = useToast();

  const requestMediaLibPermissions = async (successCb) => {
    if (libraryPermissions?.granted) {
      return successCb();
    }

    const result = await requestLibraryPermission();
    if (result.granted) {
      return successCb();
    } else {
      if (!result.canAskAgain) {
        toast.info({
          description: `请在 [系统设置] 里允许 ${appName} 访问您的照片。`,
        });
      }
    }
  };

  return {
    libraryPermissions,
    requestMediaLibPermissions,
  };
};
