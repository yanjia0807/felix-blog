import { useQuery } from '@tanstack/react-query';
import { fetchMe } from '@/api';

export const createFetchMeQuery = (accessToken) => ({
  queryKey: ['users', 'detail', 'me'],
  queryFn: fetchMe,
  enabled: !!accessToken,
});

export const useFetchMe = ({ accessToken }) => useQuery(createFetchMeQuery(accessToken));
