import { fetchMe } from '@/api';
import { useQuery } from '@tanstack/react-query';

export const createFetchMeQuery = (accessToken) => {
  const queryMe = async (accessToken) => {
    try {
      if (!accessToken) return null;
      return fetchMe();
    } catch (error) {
      throw error;
    }
  };

  return {
    queryKey: ['users', 'detail', 'me', accessToken],
    queryFn: () => queryMe(accessToken),
  };
};

export const useFetchMe = (accessToken) => {
  return useQuery(createFetchMeQuery(accessToken));
};
