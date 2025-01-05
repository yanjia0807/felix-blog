import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchMe } from '@/api';

import {
  loginUser,
  registerUser,
  registerOtp,
  verifyOtp,
  sendOtp,
  resetPassword,
  sendEmailConfirmation,
  sendResetPasswordEmail,
  changePassword,
  resetPasswordOtp,
} from '@/api/auth';
const AuthContext = createContext<any>(undefined);

export const AuthProvider = ({ children }: any) => {
  let [accessToken, setAccessToken] = useState<any>();
  const queryClient = useQueryClient();

  const { data, error, isLoading, isSuccess, status } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: fetchMe,
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
    await queryClient.setQueryData(['users', 'me'], () => null);
    setAccessToken(null);
    await SecureStore.deleteItemAsync('accessToken');

    await queryClient.removeQueries({
      queryKey: ['users', 'me'],
    });
    queryClient.clear();
  };

  const loginMutation = useMutation({
    mutationFn: (data: any) => loginUser(data),
    onSuccess: async (data: any) => {
      console.log('login successful, token:', data.jwt);
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

  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => changePassword(data),
    onSuccess: async (data: any) => {
      await SecureStore.setItemAsync('accessToken', data.jwt);
      setAccessToken(data.jwt);
    },
    onError: (error) => {
      console.error(error);
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

  const registerOtpMutation = useMutation({
    mutationFn: (data: any) => registerOtp(data),
    onSuccess: async (data: any) => {},
    onError: (error) => {
      console.error('error', error);
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: (data: any) => sendOtp(data),
    onSuccess: async (data: any) => {},
    onError: (error) => {
      console.error('error', error);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (data: any) => verifyOtp(data),
    onSuccess: async (data: any) => {
      console.log('register successful, token:', data.jwt);
      await SecureStore.setItemAsync('accessToken', data.jwt);
      setAccessToken(data.jwt);
    },
    onError: (error) => {
      console.error('error', error);
    },
  });

  const resetPasswordOtpMutation = useMutation({
    mutationFn: (data: any) => resetPasswordOtp(data),
    onSuccess: async (data) => {},
    onError: (error) => {},
  });

  return (
    <AuthContext.Provider
      value={{
        user: data,
        accessToken,
        logoutMutation,
        loginMutation,
        registerMutation,
        changePasswordMutation,
        forgetPasswordMutation,
        resetPasswordMutation,
        sendEmailConfirmationMutation,
        registerOtpMutation,
        sendOtpMutation,
        verifyOtpMutation,
        resetPasswordOtpMutation,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
