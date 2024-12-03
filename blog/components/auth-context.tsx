import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchUser } from '@/api';

import {
  loginUser,
  registerUser,
  resetPassword,
  sendEmailConfirmation,
  sendResetPasswordEmail,
} from '@/api/auth';
const AuthContext = createContext<any>(undefined);

export const AuthProvider = ({ children }: any) => {
  let [accessToken, setAccessToken] = useState<any>();
  const queryClient = useQueryClient();

  const { data, error, isLoading, isSuccess, status } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    enabled: !!accessToken,
    initialData: null,
  });

  useEffect(() => {
    const loadAuthData = async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      console.log('Loaded token:', token);
      setAccessToken(token);
    };

    loadAuthData();
  }, []);

  const logoutMutation = async () => {
    await SecureStore.deleteItemAsync('accessToken');
    setAccessToken(null);
    await queryClient.resetQueries({
      queryKey: ['user'],
    });
  };

  const loginMutation = useMutation({
    mutationFn: (data: any) => loginUser(data),
    onSuccess: async (data: any) => {
      console.log('Login successful, token:', data.jwt);
      await SecureStore.setItemAsync('accessToken', data.jwt);
      setAccessToken(data.jwt);
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
        logoutMutation,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
