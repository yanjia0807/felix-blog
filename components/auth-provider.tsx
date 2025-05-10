import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
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
import PageSpinner from './page-spinner';

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

  const [accessToken, setAccessToken] = useState<any>();
  const queryClient = useQueryClient();
  console.log('Current accessToken:', accessToken);

  const { data, isError, isLoading } = useQuery({
    queryKey: ['users', 'detail', 'me'],
    queryFn: fetchMe,
    enabled: !!accessToken,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await SecureStore.deleteItemAsync('accessToken');
      await queryClient.resetQueries();
      queryClient.clear();
      setAccessToken(null);
    },
    onError: (error: Error) => {
      throw error;
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: any) => loginUser(data),
    onSuccess: async (data: any) => {
      await SecureStore.setItemAsync('accessToken', data.jwt);
      setAccessToken(data.jwt);
    },
    onError: (error: Error) => {
      throw error;
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: any) => registerUser(data),
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
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: any) => resetPassword(data),
  });

  const sendEmailConfirmationMutation = useMutation({
    mutationFn: (data: any) => sendEmailConfirmation(data),
  });

  const registerOtpMutation = useMutation({
    mutationFn: (data: any) => registerOtp(data),
  });

  const sendOtpMutation = useMutation({
    mutationFn: (data: any) => sendOtp(data),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (data: any) => verifyOtp(data),
  });

  const resetPasswordOtpMutation = useMutation({
    mutationFn: (data: any) => resetPasswordOtp(data),
  });

  useEffect(() => {
    const loadData = async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        console.log('Loaded token:', token);
        setAccessToken(token);
      }
    };

    loadData();
  }, []);

  const value = useMemo(
    () => ({
      user: data,
      loginMutation,
      logoutMutation,
      registerMutation,
      changePasswordMutation,
      forgetPasswordMutation,
      resetPasswordMutation,
      sendEmailConfirmationMutation,
      registerOtpMutation,
      sendOtpMutation,
      verifyOtpMutation,
      resetPasswordOtpMutation,
    }),
    [
      changePasswordMutation,
      data,
      forgetPasswordMutation,
      loginMutation,
      logoutMutation,
      registerMutation,
      registerOtpMutation,
      resetPasswordMutation,
      resetPasswordOtpMutation,
      sendEmailConfirmationMutation,
      sendOtpMutation,
      verifyOtpMutation,
    ],
  );

  if (isLoading) {
    return <PageSpinner isVisiable={true} />;
  }

  if (isError) {
    return <></>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
