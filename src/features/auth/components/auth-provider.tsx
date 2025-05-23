import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
  const [user, setUser] = useState<any>(undefined);
  const removeAccessToken = useCallback(() => setAccessToken(undefined), []);
  const removeUser = useCallback(() => setUser(undefined), []);
  const fetchMeQuery = useFetchMe({ accessToken });

  useAutoLogin({ setAccessToken, setUser });

  useEffect(() => {
    setUser(fetchMeQuery.data);
  }, [fetchMeQuery.data]);

  const value = useMemo(() => {
    return {
      accessToken,
      setAccessToken,
      removeAccessToken,
      user,
      setUser,
      removeUser,
    };
  }, [accessToken, user, removeAccessToken, removeUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
