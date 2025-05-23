import { useEffect, useState } from 'react';
import { getDeviceId } from '@/utils/common';

export const useDeviceId = () => {
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);

  useEffect(() => {
    getDeviceId().then((id) => setDeviceId(id));
  }, []);

  return {
    deviceId,
  };
};
