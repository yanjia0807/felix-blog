import { fetchMe } from '@/api';
import { useQuery } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

export const createFetchMeQuery = () => {
  const queryMe = async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      if (accessToken) {
        return fetchMe();
      }
      return null;
    } catch (error) {
      console.error(error);
      SecureStore.deleteItemAsync('accessToken');
      throw error;
    }
  };

  return {
    queryKey: ['users', 'detail', 'me'],
    queryFn: queryMe,
  };
};

export const useFetchMe = () => {
  return useQuery(createFetchMeQuery());
};
