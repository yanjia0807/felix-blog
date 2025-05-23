import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

export const useAutoLogin = ({ setAccessToken }) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const load = async () => {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      if (accessToken) {
        setAccessToken(accessToken);
      }
    };

    load();
  }, [queryClient, setAccessToken]);
};
