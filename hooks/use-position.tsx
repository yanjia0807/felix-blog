import { useState, useEffect, useCallback } from 'react';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { init, Geolocation, Position, PositionError } from 'react-native-amap-geolocation';
import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { amapIosApiKey } from '@/api';
import useCustomToast from '@/hooks/use-custom-toast';

type UsePositionReturn = {
  position: Position | null;
  error: string | null;
  refresh: (callback: any) => Promise<void>;
};

const appName = Constants?.expoConfig?.extra?.name || '';

function usePosition(): UsePositionReturn {
  const toast = useCustomToast();
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkLocationPermission = useCallback(async (): Promise<boolean> => {
    console.log('checkLocationPermission');
    try {
      const permission = Platform.select({
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      });

      if (!permission) {
        setError('Unsupported platform');
        return false;
      }

      const status = await check(permission);

      if (status === RESULTS.BLOCKED) {
        toast.info({
          description: `请在系统设置中允许 ${appName} 访问您的位置`,
        });
        return false;
      }

      if (status !== RESULTS.GRANTED) {
        const requestStatus = await request(permission);
        if (requestStatus !== RESULTS.GRANTED) {
          toast.info({
            description: `请在系统设置中允许 ${appName} 访问您的位置`,
          });
          return false;
        }
      }

      return true;
    } catch (err) {
      console.error('Permission check error:', err);
      setError('权限检查失败');
      return false;
    }
  }, []);

  const getCurrentPosition = useCallback(async (): Promise<Position | null> => {
    try {
      console.log('getCurrentPosition');
      setError(null);

      await init({
        ios: amapIosApiKey as string,
        android: '',
      });

      return new Promise((resolve) => {
        Geolocation.getCurrentPosition(
          (pos: Position) => {
            setPosition(pos);
            resolve(pos);
          },
          (err: PositionError) => {
            setError(`定位失败: ${err.message}`);
            resolve(null);
          },
        );
      });
    } catch (err) {
      setError('定位服务初始化失败');
      return null;
    }
  }, []);

  const refresh = useCallback(
    async (callback?: any) => {
      console.log('refresh');
      const hasPermission = await checkLocationPermission();
      if (hasPermission) {
        const pos = await getCurrentPosition();
        if (callback && pos) {
          callback(pos);
        }
      }
    },
    [checkLocationPermission, getCurrentPosition],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { position, error, refresh };
}

export default usePosition;
