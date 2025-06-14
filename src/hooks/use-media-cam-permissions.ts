import { useCameraPermissions } from 'expo-camera';
import Constants from 'expo-constants';
import useToast from './use-toast';

const appName = Constants?.expoConfig?.extra?.name || '';

export const useMediaCamPermissions = () => {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const toast = useToast();

  const requestMediaCamPermissions = async (successCb) => {
    if (cameraPermission?.granted) {
      return successCb();
    }

    const result = await requestCameraPermission();
    if (result.granted) {
      return successCb();
    } else {
      if (!result.canAskAgain) {
        toast.info({
          description: `请在 [系统设置] 里允许 ${appName} 访问您的相机。`,
        });
      }
    }
  };

  return {
    cameraPermission,
    requestMediaCamPermissions,
  };
};
