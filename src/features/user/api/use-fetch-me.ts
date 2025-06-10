import { fetchMe } from '@/api';
import { useQuery } from '@tanstack/react-query';

export const useFetchMe = (accessToken) => {
  return useQuery({
    queryKey: ['users', 'detail', 'me'],
    enabled: !!accessToken,
    queryFn: fetchMe,
  });
};
