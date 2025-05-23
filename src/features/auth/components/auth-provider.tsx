import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useFetchMe } from '@/features/user/api/use-fetch-me';
import { useAutoLogin } from '../hooks/use-auto-login';

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
  const removeAccessToken = useCallback(() => setAccessToken(undefined), []);
  const fetchMeQuery = useFetchMe({ accessToken });
  useAutoLogin({ setAccessToken });

  const value = useMemo(() => {
    return {
      accessToken,
      setAccessToken,
      removeAccessToken,
      user: fetchMeQuery?.data,
    };
  }, [accessToken, fetchMeQuery?.data, removeAccessToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
