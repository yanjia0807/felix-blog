import { fetchMe } from '@/api';
import { useQuery } from '@tanstack/react-query';

export const createFetchMeQuery = (accessToken) => ({
  queryKey: ['users', 'detail', 'me'],
  enabled: !!accessToken,
  queryFn: fetchMe,
});

export const useFetchMe = (accessToken) => {
  return useQuery(createFetchMeQuery(accessToken));
};
