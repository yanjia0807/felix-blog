import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { useFetchMe } from '@/features/user/api/use-fetch-me';

export const useAutoLogin = () => {
  const queryClient = useQueryClient();
  const [accessToken, setAccessToken] = useState<string | undefined>();
  const fetchMeQuery = useFetchMe({ accessToken });
  const removeAccessToken = useCallback(() => setAccessToken(undefined), []);

  useEffect(() => {
    const load = async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        setAccessToken(token);
      }
    };

    load();
  }, [queryClient, setAccessToken]);

  return {
    fetchMeQuery,
    accessToken,
    removeAccessToken,
  };
};
