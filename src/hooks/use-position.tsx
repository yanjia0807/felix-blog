import { amapIosApiKey } from '@/api';
import { useEffect, useState } from 'react';
import { Geolocation, init, Position, PositionError } from 'react-native-amap-geolocation';
import { useLocationPermissions } from './use-location-permissions';

function usePosition() {
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { requesLocationPermissions } = useLocationPermissions();

  useEffect(() => {
    const getCurrentPosition = async () => {
      console.log('getCurrentPosition');

      const permission = await requesLocationPermissions();
      if (permission !== 'granted') return;

      try {
        await init({
          ios: amapIosApiKey as string,
          android: '',
        });

        Geolocation.getCurrentPosition(
          (pos: Position) => {
            setPosition(pos);
          },
          (error: PositionError) => {
            console.error(error);
            setError(`定位失败: ${error.message}`);
          },
        );
      } catch (error) {
        console.error(error);
        setError('定位服务初始化失败');
      }
    };

    getCurrentPosition();
  }, []);

  return { position, setPosition, error };
}

export default usePosition;
