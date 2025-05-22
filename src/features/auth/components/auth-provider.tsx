import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
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
  useEffect(() => console.log('@render AuthProvider'));

  const [accessToken, setAccessToken] = useState<string | undefined>();
  const meQuery = useFetchMe({ accessToken });

  const removeAccessToken = useCallback(() => setAccessToken(undefined), []);

  if (meQuery.status === 'error') {
    removeAccessToken();
  }

  useEffect(() => {
    const loadData = async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        setAccessToken(token);
      }
    };

    loadData();
  }, []);

  const value = useMemo(() => {
    return {
      accessToken,
      user: meQuery.data,
      setAccessToken,
      removeAccessToken,
    };
  }, [accessToken, meQuery.data, removeAccessToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
