import { fetchExpoPushToken } from '@/api';
import { useQuery } from '@tanstack/react-query';

export const createFetchExpoPushTokenQuery = (deviceId) => ({
  queryKey: ['expoPushTokens', 'detail', { deviceId }],
  queryFn: () => fetchExpoPushToken({ deviceId }),
  enabled: !!deviceId,
});

export const useFetchExpoPushToken = ({ deviceId }) =>
  useQuery(createFetchExpoPushTokenQuery(deviceId));
