import React, { createContext, useContext, useMemo } from 'react';
import PageSpinner from '@/components/page-spinner';
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
  const { fetchMeQuery, accessToken, removeAccessToken } = useAutoLogin();

  const value = useMemo(() => {
    return {
      accessToken,
      removeAccessToken,
      user: fetchMeQuery?.data,
    };
  }, [accessToken, fetchMeQuery?.data, removeAccessToken]);

  if (!fetchMeQuery.isLoading) {
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  }

  return <PageSpinner />;
};
