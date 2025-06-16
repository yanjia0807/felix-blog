import PageSpinner from '@/components/page-spinner';
import { useFetchMe } from '@/features/user/api/use-fetch-me';
import React, { createContext, useContext, useMemo } from 'react';

const AuthContext = createContext<any>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: any) => {
  const fetchMeQuery = useFetchMe();

  const value = useMemo(() => {
    return {
      user: fetchMeQuery.data,
    };
  }, [fetchMeQuery.data]);

  if (fetchMeQuery.isLoading) {
    return <PageSpinner />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
