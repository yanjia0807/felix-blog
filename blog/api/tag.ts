import { apiAxios } from './config';
import qs from 'qs';
import { baseURL } from './config';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
  console.log(`${baseURL}/api/tags?${query}`);
  const res = await apiAxios.get(`${baseURL}/api/tags?${query}`);
  return res.data.data;
};

export const useFetchTags = ({ name }: any) => {
  return useQuery({
    queryKey: ['tags', { name }],
    queryFn: fetchTags,
  });
};
