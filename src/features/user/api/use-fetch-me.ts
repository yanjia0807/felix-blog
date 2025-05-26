import { useQuery } from '@tanstack/react-query';
import { fetchMe } from '@/api';

export const createFetchMeQuery = () => ({
  queryKey: ['users', 'detail', 'me'],
  queryFn: fetchMe,
});

export const useFetchMe = () => useQuery(createFetchMeQuery());
