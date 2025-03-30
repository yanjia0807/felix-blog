import qs from 'qs';
import { apiClient } from './api-client';

export const fetchTags = async ({ name }: any) => {
  const query = name
    ? qs.stringify({
        filters: { name: { $contains: name } },
      })
    : '';

  const res = await apiClient.get(`/tags?${query}`);
  return res.data;
};
