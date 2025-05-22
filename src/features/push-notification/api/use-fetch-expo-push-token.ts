import { useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { fetchExpoPushToken } from '@/api';

export const createFetchExpoPushTokenQuery = (deviceId) => ({
  queryKey: ['expoPushTokens', 'detail', { deviceId }],
  queryFn: () => fetchExpoPushToken({ deviceId }),
  enabled: !_.isNil(deviceId),
});

export const useFetchExpoPushToken = ({ deviceId }) =>
  useQuery(createFetchExpoPushTokenQuery(deviceId));
