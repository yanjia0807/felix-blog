import { apiAxios } from './config';
import qs from 'qs';
import { useQuery } from '@tanstack/react-query';

export const fetchTags = async ({ queryKey }: any) => {
  const [_key, { name }] = queryKey;
  const query = name
    ? qs.stringify(
        {
          filters: { name: { $contains: name } },
        },
        {
          encodeValuesOnly: true,
        },
      )
    : '';
  const res = await apiAxios.get(`/tags?${query}`);
  return res.data;
};

export const useFetchTags = ({ name }: any) => {
  return useQuery({
    queryKey: ['tags', { name }],
    queryFn: fetchTags,
  });
};
