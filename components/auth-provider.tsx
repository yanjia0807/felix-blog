import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { DeviceEventEmitter } from 'react-native';
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
import useCustomToast from './use-custom-toast';

const AuthContext = createContext<any>(undefined);

export const AuthProvider = ({ children }: any) => {
  const [accessToken, setAccessToken] = useState<any>();
  const [user, setUser] = useState<any>(null);
  const queryClient = useQueryClient();
  const router = useRouter();
  const toast = useCustomToast();

  const { data, isError, isSuccess } = useQuery({
    queryKey: ['users', 'detail', 'me'],
    queryFn: fetchMe,
    enabled: !!accessToken,
  });

  const logoutMutation = useCallback(async () => {
    setAccessToken(null);
    setUser(null);
    queryClient.clear();
    await SecureStore.deleteItemAsync('accessToken');
  }, [queryClient]);

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

  useEffect(() => {
    const loadData = async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      debugger;
      if (token) {
        console.log('Loaded token:', token);
        setAccessToken(token);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (isSuccess) {
      setUser(data);
    } else if (isError) {
      setUser(null);
    }
  }, [data, isError, isSuccess]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('UNAUTHORIZED', async () => {
      console.log('登录状态已失效');
      logoutMutation();
    });
    return () => subscription.remove();
  }, [logoutMutation, router, toast]);

  return (
    <AuthContext.Provider
      value={{
        user,
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
