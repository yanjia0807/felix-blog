import { getDeviceId } from '@/utils/common';
import { useEffect, useState } from 'react';

export const useDeviceId = () => {
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined);

  useEffect(() => {
    getDeviceId().then((id) => setDeviceId(id));
  }, []);

  return {
    deviceId,
  };
};
