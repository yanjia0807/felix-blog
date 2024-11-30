import { useQuery } from '@tanstack/react-query';
import qs from 'qs';
import { apiClient } from './config';

export const fetchTags = async ({ name }: any) => {
  const query = name
    ? qs.stringify({
        filters: { name: { $contains: name } },
      })
    : '';
  const res = await apiClient.get(`/tags?${query}`);
  return res.data;
};

export const useFetchTags = ({ name }: any) => {
  return useQuery({
    queryKey: ['tags', { name }],
    queryFn: fetchTags,
  });
};
