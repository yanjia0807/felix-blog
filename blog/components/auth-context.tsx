import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  loginUser,
  registerUser,
  resetPassword,
  sendEmailConfirmation,
  sendResetPasswordEmail,
} from '@/api/auth';
import { fetchUser, setAuthHeader } from '@/api';
const AuthContext = createContext<any>(undefined);

export const AuthProvider = ({ children }: any) => {
  const [tokenExists, setTokenExists] = useState<boolean>(false);
  const queryClient = useQueryClient();

  const { data, error, isFetching, isSuccess, status } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    enabled: tokenExists,
  });

  useEffect(() => {
    const loadAuthData = async () => {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) {
        setAuthHeader(accessToken);
        setTokenExists(true);
      } else {
        setAuthHeader(null);
        setTokenExists(false);
      }
    };

    loadAuthData();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem('accessToken');
    queryClient.removeQueries({ queryKey: ['user'] });
    setTokenExists(false);
    setAuthHeader(null);
  };

  const loginMutation = useMutation({
    mutationFn: (data: any) => loginUser(data),
    onSuccess: async (data: any) => {
      await AsyncStorage.setItem('accessToken', data.jwt);
      setAuthHeader(data.jwt);
      setTokenExists(true);
    },
    onError: (error: Error) => {
      throw error;
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: any) => registerUser(data),
    onSuccess: async (data: any) => {},
    onError: (error) => {
      console.error('error', error);
    },
  });

  const forgetPasswordMutation = useMutation({
    mutationFn: (data: any) => sendResetPasswordEmail(data),
    onSuccess: async (data) => {},
    onError: (error) => {
      console.error(error);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: any) => resetPassword(data),
    onSuccess: async (data) => {},
    onError: (error) => {},
  });

  const sendEmailConfirmationMutation = useMutation({
    mutationFn: (data: any) => sendEmailConfirmation(data),
    onSuccess: async (data) => {},
    onError: (error) => {
      console.error(error);
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: data,
        loginMutation,
        registerMutation,
        forgetPasswordMutation,
        resetPasswordMutation,
        sendEmailConfirmationMutation,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
