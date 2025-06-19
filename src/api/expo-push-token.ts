import qs from 'qs';
import { apiClient } from '../utils/api-client';

export const fetchExpoPushToken = async ({ deviceId }) => {
  const query = qs.stringify(
    {
      filter: {
        deviceId,
      },
    },
    {
      encodeValuesOnly: true,
    },
  );

  const res = await apiClient.get(`/expo-push-tokens?${query}`);
  return (res.data && res.data[0]) || null;
};

export const createExpoPushToken = async (data) => {
  const query = qs.stringify({
    populate: {
      user: {
        fields: ['id', 'documentId'],
      },
    },
  });
  const res = await apiClient.post(`/expo-push-tokens?${query}`, data);
  return res.data;
};

export const updateExpoPushToken = async ({ data }: any) => {
  const { documentId, ...rest } = data;

  const query = qs.stringify({
    populate: {
      user: {
        fields: ['id', 'documentId'],
      },
    },
  });

  const res = await apiClient.put(`/expo-push-tokens/${documentId}?${query}`, { data: rest });
  return res.data;
};
