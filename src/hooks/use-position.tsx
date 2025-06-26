import { amapIosApiKey } from '@/api';
import { useCallback, useState } from 'react';
import { Geolocation, init, Position, PositionError } from 'react-native-amap-geolocation';
import { RESULTS } from 'react-native-permissions';
import { useLocationPermissions } from './use-location-permissions';

function usePosition() {
  const [position, setPosition] = useState<Position | null>(null);
  const { requesLocationPermissions } = useLocationPermissions();

  const getCurrentPosition = useCallback(async () => {
    const permission = await requesLocationPermissions();

    if (permission === RESULTS.GRANTED) {
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
          },
        );
      } catch (error) {
        console.error(error);
      }
    }
  }, [requesLocationPermissions]);

  return { position, getCurrentPosition };
}

export default usePosition;
