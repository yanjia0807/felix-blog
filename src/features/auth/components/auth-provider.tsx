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
  const [accessToken, setAccessToken] = useState<undefined | string>();
  const { isLoading, isError, data } = useFetchMe(accessToken);
  const queryClient = useQueryClient();

  const updateAccessToken = useCallback(async (token) => {
    await SecureStore.setItemAsync('accessToken', token);
    setAccessToken(token);
  }, []);

  const clearAccessToken = useCallback(async () => {
    await SecureStore.deleteItemAsync('accessToken');
    setAccessToken(null);
  }, []);

  if (isError) {
    clearAccessToken();
  }

  useEffect(() => {
    const loadToken = async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      setAccessToken(token);
    };

    loadToken();
  }, [queryClient]);

  const value = useMemo(() => {
    return {
      accessToken,
      user: data,
      updateAccessToken,
      clearAccessToken,
    };
  }, [accessToken, data, clearAccessToken, updateAccessToken]);

  if (isLoading) {
    return <PageSpinner />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
