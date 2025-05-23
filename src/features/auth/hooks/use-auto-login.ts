import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { createFetchMeQuery } from '@/features/user/api/use-fetch-me';

export const useAutoLogin = ({ setAccessToken, setUser }) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const load = async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        setAccessToken(token);
        const user = await queryClient.fetchQuery(createFetchMeQuery(token));
        if (user) setUser(user);
      }
    };

    load();
  }, [queryClient, setAccessToken, setUser]);
};
