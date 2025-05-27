import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import PageSpinner from '@/components/page-spinner';
import { useFetchMe } from '@/features/user/api/use-fetch-me';

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
  const fetchMeQuery = useFetchMe();
  const queryClient = useQueryClient();

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
      user: fetchMeQuery?.data,
    };
  }, [accessToken, fetchMeQuery?.data, doLogin, doLogout]);

  if (!fetchMeQuery.isLoading) {
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  }

  return <PageSpinner />;
};
