import PageSpinner from '@/components/page-spinner';
import { useFetchMe } from '@/features/user/api/use-fetch-me';
import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext<any>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: any) => {
  const [accessToken, setAccessToken] = useState<string | undefined>();
  const queryClient = useQueryClient();

  const fetchMeQuery = useFetchMe(accessToken);

  const doLogin = useCallback(
    (token) => {
      setAccessToken(token);
      SecureStore.setItemAsync('accessToken', token);
      queryClient.invalidateQueries({ queryKey: ['users', 'detail', 'me'] });
    },
    [queryClient],
  );

  const doLogout = useCallback(async () => {
    setAccessToken(undefined);
    queryClient.clear();
    await SecureStore.deleteItemAsync('accessToken');
  }, [queryClient]);

  useEffect(() => {
    const load = async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        setAccessToken(token);
      }
    };

    load();
  }, [queryClient, setAccessToken]);

  const value = useMemo(() => {
    return {
      accessToken,
      doLogin,
      doLogout,
      user: fetchMeQuery.data,
    };
  }, [accessToken, fetchMeQuery.data, doLogin, doLogout]);

  if (fetchMeQuery.isLoading) {
    return <PageSpinner />;
  }

  if (fetchMeQuery.isError) {
    SecureStore.deleteItemAsync('accessToken');
    setAccessToken(undefined);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
